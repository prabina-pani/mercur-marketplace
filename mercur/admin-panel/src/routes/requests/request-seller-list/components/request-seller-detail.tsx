import { useState } from "react";

import { DocumentText, InformationCircle } from "@medusajs/icons";
import {
  Button,
  Container,
  Drawer,
  Text,
  toast,
} from "@medusajs/ui";

import type { AdminSellerRequest } from "@custom-types/requests";

import { formatDate } from "@lib/date";
import { downloadSellerRegistrationDocument } from "@lib/seller-registration-download";
import { SellerRegistrationPayloadGrid } from "@lib/seller-registration-payload-display";

import { useSellerRegistration } from "@hooks/api/seller-registrations";

import { ResolveRequestPrompt } from "@routes/requests/common/components/resolve-request";

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  vat_registration_certificate: "VAT registration certificate",
  updated_company_affidavit: "Updated company affidavit",
};

type Props = {
  request?: AdminSellerRequest;
  open: boolean;
  close: () => void;
};

export function RequestSellerDetail({ request, open, close }: Props) {
  const sellerRegistrationId = request?.data?.seller_registration_id;

  const { seller_registration: registrationDetail, isLoading: docsLoading } =
    useSellerRegistration(sellerRegistrationId, {
      enabled: open && !!sellerRegistrationId,
    });

  const [promptOpen, setPromptOpen] = useState(false);
  const [requestAccept, setRequestAccept] = useState(false);

  if (!request) {
    return null;
  }

  const requestData = request.data;

  const inlineRegistrationPayload = requestData
    ?.seller_registration_payload as Record<string, unknown> | undefined;
  const fetchedRegistrationPayload = registrationDetail?.payload as
    | Record<string, unknown>
    | undefined;
  const registrationPayloadForDisplay =
    fetchedRegistrationPayload ?? inlineRegistrationPayload;
  const hasSelfServiceRegistration =
    Boolean(sellerRegistrationId) || Boolean(inlineRegistrationPayload);

  const handlePrompt = (_: string, accept: boolean) => {
    setRequestAccept(accept);
    setPromptOpen(true);
  };

  return (
    <Drawer open={open} onOpenChange={close} data-testid={`request-seller-detail-${request.id}`}>
      <ResolveRequestPrompt
        close={() => {
          setPromptOpen(false);
        }}
        open={promptOpen}
        id={request.id!}
        accept={requestAccept}
        onSuccess={() => {
          close();
        }}
      />
      <Drawer.Content data-testid={`request-seller-detail-${request.id}-content`}>
        <Drawer.Header data-testid={`request-seller-detail-${request.id}-header`}>
          <Drawer.Title data-testid={`request-seller-detail-${request.id}-title`}>Review seller request</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="p-4" data-testid={`request-seller-detail-${request.id}-body`}>
          {!hasSelfServiceRegistration && (
            <>
              <fieldset data-testid={`request-seller-detail-${request.id}-seller-name-fieldset`}>
                <legend className="mb-2" data-testid={`request-seller-detail-${request.id}-seller-name-legend`}>Seller name</legend>
                <Container data-testid={`request-seller-detail-${request.id}-seller-name-container`}>
                  <Text data-testid={`request-seller-detail-${request.id}-seller-name-value`}>{requestData?.seller?.name ?? "-"}</Text>
                </Container>
              </fieldset>
              <fieldset className="mt-2" data-testid={`request-seller-detail-${request.id}-member-fieldset`}>
                <legend className="mb-2" data-testid={`request-seller-detail-${request.id}-member-legend`}>Member</legend>
                <Container data-testid={`request-seller-detail-${request.id}-member-container`}>
                  <Text data-testid={`request-seller-detail-${request.id}-member-value`}>{requestData?.member?.name ?? "-"}</Text>
                </Container>
              </fieldset>
              <fieldset className="mt-2" data-testid={`request-seller-detail-${request.id}-email-fieldset`}>
                <legend className="mb-2" data-testid={`request-seller-detail-${request.id}-email-legend`}>Email</legend>
                <Container data-testid={`request-seller-detail-${request.id}-email-container`}>
                  <Text data-testid={`request-seller-detail-${request.id}-email-value`}>{requestData?.provider_identity_id ?? "N/A"}</Text>
                </Container>
              </fieldset>
            </>
          )}
          {hasSelfServiceRegistration && (
            <Container
              className="mt-4"
              data-testid={`request-seller-detail-${request.id}-registration-payload`}
            >
              {sellerRegistrationId &&
              docsLoading &&
              registrationPayloadForDisplay === undefined ? (
                <Text size="small" className="text-ui-fg-muted">
                  Loading application details…
                </Text>
              ) : (
                <SellerRegistrationPayloadGrid
                  payload={registrationPayloadForDisplay ?? {}}
                  title="Submitted application"
                />
              )}
            </Container>
          )}
          {sellerRegistrationId && (
            <Container className="mt-4" data-testid={`request-seller-detail-${request.id}-documents`}>
              <div className="mb-2 flex items-center gap-2">
                <DocumentText className="text-ui-fg-muted" />
                <Text className="font-semibold">Registration documents</Text>
              </div>
              {docsLoading && (
                <Text size="small" className="text-ui-fg-muted">
                  Loading documents…
                </Text>
              )}
              {!docsLoading &&
                registrationDetail?.documents &&
                registrationDetail.documents.length > 0 && (
                  <div
                    className="border-ui-border-base divide-ui-border-base overflow-hidden rounded-lg border divide-y"
                    data-testid={`request-seller-detail-${request.id}-documents-list`}
                  >
                    <div className="bg-ui-bg-subtle txt-compact-small-plus text-ui-fg-subtle hidden items-center gap-4 px-4 py-2 sm:grid sm:grid-cols-[1fr_minmax(0,1fr)_auto]">
                      <span>Type</span>
                      <span>File</span>
                      <span className="text-right">Action</span>
                    </div>
                    {registrationDetail.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="bg-ui-bg-base hover:bg-ui-bg-base-hover transition-fg flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0 flex-1 sm:grid sm:grid-cols-[1fr_minmax(0,1fr)] sm:gap-4 sm:items-center">
                          <Text size="small" className="text-ui-fg-base font-medium">
                            {DOCUMENT_TYPE_LABELS[doc.document_type] ??
                              doc.document_type}
                          </Text>
                          <Text
                            size="small"
                            className="text-ui-fg-muted mt-0.5 max-w-full truncate sm:mt-0"
                            title={doc.original_filename}
                          >
                            {doc.original_filename}
                          </Text>
                        </div>
                        <div className="flex shrink-0 justify-end sm:justify-end">
                          <Button
                            size="small"
                            variant="secondary"
                            type="button"
                            className="!rounded-md shrink-0 whitespace-nowrap"
                            onClick={async () => {
                              try {
                                await downloadSellerRegistrationDocument(
                                  sellerRegistrationId,
                                  doc.id,
                                  doc.original_filename,
                                );
                              } catch (e: unknown) {
                                toast.error(
                                  e instanceof Error
                                    ? e.message
                                    : "Download failed",
                                );
                              }
                            }}
                          >
                            View / download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              {!docsLoading &&
                registrationDetail?.documents &&
                registrationDetail.documents.length === 0 && (
                  <Text size="small" className="text-ui-fg-muted">
                    No documents found for this registration.
                  </Text>
                )}
            </Container>
          )}
          <Container className="mt-4" data-testid={`request-seller-detail-${request.id}-request-information`}>
            <div className="flex items-center gap-2" data-testid={`request-seller-detail-${request.id}-request-information-header`}>
              <InformationCircle />
              <Text className="font-semibold" data-testid={`request-seller-detail-${request.id}-request-information-title`}>Request information</Text>
            </div>
            <Text data-testid={`request-seller-detail-${request.id}-submitted-on`}>{`Submitted on ${formatDate(request.created_at)}`}</Text>
            {request.reviewer_id && (
              <Text data-testid={`request-seller-detail-${request.id}-reviewed-on`}>{`Reviewed on ${formatDate(request.updated_at)}`}</Text>
            )}
            {request.reviewer_note && (
              <Text data-testid={`request-seller-detail-${request.id}-reviewer-note`}>{`Reviewer note: ${request.reviewer_note}`}</Text>
            )}
          </Container>
        </Drawer.Body>
        <Drawer.Footer data-testid={`request-seller-detail-${request.id}-footer`}>
          {request.status === "pending" && (
            <>
              <Button
                onClick={() => {
                  handlePrompt(request.id!, true);
                }}
                data-testid={`request-seller-detail-${request.id}-accept-button`}
              >
                Accept
              </Button>
              <Button
                onClick={() => {
                  handlePrompt(request.id!, false);
                }}
                variant="danger"
                data-testid={`request-seller-detail-${request.id}-reject-button`}
              >
                Reject
              </Button>
              <Button variant="secondary" onClick={close} data-testid={`request-seller-detail-${request.id}-cancel-button`}>
                Cancel
              </Button>
            </>
          )}
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
}

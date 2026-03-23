import { sdk } from "@lib/client"

/**
 * Download via authenticated GET (admin JWT); opens/saves file in the browser.
 */
export async function downloadSellerRegistrationDocument(
  registrationId: string,
  documentId: string,
  originalFilename: string,
): Promise<void> {
  const res = (await sdk.client.fetch(
    `/admin/seller-registrations/${registrationId}/documents/${documentId}/download`,
    {
      method: "GET",
      headers: { accept: "application/octet-stream" },
    },
  )) as unknown as Response

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = originalFilename
  a.rel = "noopener"
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

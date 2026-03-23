import { sdk } from "@lib/client"
import { queryKeysFactory } from "@lib/query-key-factory"
import type { SellerRegistrationDetail } from "@custom-types/seller-registration"
import {
  type QueryKey,
  type UseQueryOptions,
  useQuery,
} from "@tanstack/react-query"

export const sellerRegistrationQueryKeys = queryKeysFactory("seller-registrations")

type DetailResponse = { seller_registration: SellerRegistrationDetail }

export const useSellerRegistration = (
  id: string | undefined,
  options?: Omit<
    UseQueryOptions<DetailResponse, Error, DetailResponse, QueryKey>,
    "queryKey" | "queryFn"
  >,
) => {
  const { data, ...rest } = useQuery({
    queryKey: sellerRegistrationQueryKeys.detail(id ?? ""),
    queryFn: () =>
      sdk.client.fetch<DetailResponse>(`/admin/seller-registrations/${id}`, {
        method: "GET",
      }),
    enabled: !!id,
    ...options,
  })
  return {
    seller_registration: data?.seller_registration,
    data,
    ...rest,
  }
}

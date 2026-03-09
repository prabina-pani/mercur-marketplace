export type PromotionExtendedData = {
  id: string
  start_date?: Date | null
  end_date?: Date | null
  order_count?: number
  created_at?: Date
  updated_at?: Date
  deleted_at?: Date | null
}

export type PromotionWithExtended = {
  id: string
  promotion_extended?: PromotionExtendedData | null
  [key: string]: unknown
}

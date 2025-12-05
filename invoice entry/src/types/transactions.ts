export type TxType = 'income' | 'expense'

export interface TransactionInput {
  title: string
  amount: number
  type: TxType
  date: string // YYYY-MM-DD
}

export interface Transaction extends TransactionInput {
  id: string
  user_id: string
  created_at: string
}

export interface AuthPayload {
  sub: string // user id
  email: string
}

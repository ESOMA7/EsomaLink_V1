
export interface Database {
  public: {
    Tables: {
      appointments: {
        Row: {
          id: number
          user_id: string
          title: string
          start: string
          end: string
          professional: string
          patient: string
          procedure: string
        }
        Insert: {
          id?: number
          user_id: string
          title: string
          start: string
          end: string
          professional: string
          patient: string
          procedure: string
        }
        Update: {
          id?: number
          user_id?: string
          title?: string
          start?: string
          end?: string
          professional?: string
          patient?: string
          procedure?: string
        }
      }
      interventions: {
        Row: {
          id: number
          user_id: string
          patient: string
          phone: string
          reason: string
          date: string
          status: "Resuelto" | "En Proceso" | "Pendiente"
        }
        Insert: {
          id?: number
          user_id: string
          patient: string
          phone: string
          reason: string
          date: string
          status: "Resuelto" | "En Proceso" | "Pendiente"
        }
        Update: {
          id?: number
          user_id?: string
          patient?: string
          phone?: string
          reason?: string
          date?: string
          status?: "Resuelto" | "En Proceso" | "Pendiente"
        }
      }
      payments: {
        Row: {
          id: number
          user_id: string
          transaction_id: string
          patient: string
          whatsapp: string
          para: string
          amount: number
          bank: string
          date: string
        }
        Insert: {
          id?: number
          user_id: string
          transaction_id: string
          patient: string
          whatsapp: string
          para: string
          amount: number
          bank: string
          date: string
        }
        Update: {
          id?: number
          user_id?: string
          transaction_id?: string
          patient?: string
          whatsapp?: string
          para?: string
          amount?: number
          bank?: string
          date?: string
        }
      }
      notes: {
        Row: {
          id: number
          user_id: string
          title: string
          content: string
          updatedAt: string
        }
        Insert: {
          id?: number
          user_id: string
          title: string
          content: string
          updatedAt: string
        }
        Update: {
          id?: number
          user_id?: string
          title?: string
          content?: string
          updatedAt?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

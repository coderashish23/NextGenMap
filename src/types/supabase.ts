export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      buildings: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      floors: {
        Row: {
          id: string
          building_id: string
          floor_number: number
          label: string
          width: number
          height: number
          image_url: string | null
          scale_px_per_meter: number
          sort_order: number
        }
        Insert: {
          id?: string
          building_id: string
          floor_number: number
          label: string
          width?: number
          height?: number
          image_url?: string | null
          scale_px_per_meter?: number
          sort_order?: number
        }
        Update: {
          id?: string
          building_id?: string
          floor_number?: number
          label?: string
          width?: number
          height?: number
          image_url?: string | null
          scale_px_per_meter?: number
          sort_order?: number
        }
      }
      rooms: {
        Row: {
          id: string
          floor_id: string
          name: string
          type: string
          x: number
          y: number
          width: number
          height: number
          polygon: Json | null
        }
        Insert: {
          id?: string
          floor_id: string
          name: string
          type?: string
          x: number
          y: number
          width?: number
          height?: number
          polygon?: Json | null
        }
        Update: {
          id?: string
          floor_id?: string
          name?: string
          type?: string
          x?: number
          y?: number
          width?: number
          height?: number
          polygon?: Json | null
        }
      }
      connections: {
        Row: {
          id: string
          from_room_id: string
          to_room_id: string
          type: string
          bidirectional: boolean
        }
        Insert: {
          id?: string
          from_room_id: string
          to_room_id: string
          type?: string
          bidirectional?: boolean
        }
        Update: {
          id?: string
          from_room_id?: string
          to_room_id?: string
          type?: string
          bidirectional?: boolean
        }
      }
      anchors: {
        Row: {
          id: string
          floor_id: string
          label: string
          x: number
          y: number
          heading: number
          qr_data: string
        }
        Insert: {
          id?: string
          floor_id: string
          label: string
          x: number
          y: number
          heading: number
          qr_data: string
        }
        Update: {
          id?: string
          floor_id?: string
          label?: string
          x?: number
          y?: number
          heading?: number
          qr_data?: string
        }
      }
      nav_sessions: {
        Row: {
          id: string
          user_id: string
          building_id: string
          current_floor_id: string
          current_x: number
          current_y: number
          current_heading: number
          destination_room_id: string | null
          started_at: string
          ended_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          building_id: string
          current_floor_id: string
          current_x: number
          current_y: number
          current_heading: number
          destination_room_id?: string | null
          started_at?: string
          ended_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          building_id?: string
          current_floor_id?: string
          current_x?: number
          current_y?: number
          current_heading?: number
          destination_room_id?: string | null
          started_at?: string
          ended_at?: string | null
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

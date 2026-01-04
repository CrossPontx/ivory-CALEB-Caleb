// TypeScript declarations for Langflow custom elements

declare namespace JSX {
  interface IntrinsicElements {
    'langflow-chat': {
      window_title?: string
      flow_id?: string
      host_url?: string
      chat_input_field?: string
      chat_trigger_style?: string
      key?: string | number
      children?: React.ReactNode
    }
  }
}

// Extend Window interface for Langflow
declare global {
  interface Window {
    LangflowChat?: any
  }
}

export {}

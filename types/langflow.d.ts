// TypeScript declarations for Langflow custom elements

declare global {
  interface Window {
    LangflowChat?: any
  }

  namespace JSX {
    interface IntrinsicElements {
      'langflow-chat': {
        key?: string | number
        window_title?: string
        flow_id?: string
        host_url?: string
        chat_position?: string
        placeholder?: string
        placeholder_sending?: string
        online_message?: string
        chat_window_style?: string
        bot_message_style?: string
        user_message_style?: string
        chat_input_field?: string
        chat_inputs?: string
        chat_output_key?: string
        tweaks?: string
        children?: React.ReactNode
      }
    }
  }
}

export {}

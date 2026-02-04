import MarkdownRender from '../MarkdownRender'
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput
} from '../ui/shadcn-io/ai/tool'
import type { MessageStatus } from '@/types/model/model-config'

// AI调用工具的消息
export const ToolMessage = ({
  id,
  content,
  tool_name,
  status = 'completed'
}: {
  id: string
  content: string
  tool_name: string
  status?: MessageStatus
}) => {
  const { input, output, error } = JSON.parse(content)
  const toolCall = {
    type: tool_name,
    toolCallId: id,
    input: input,
    output: output ? '```json\n' + output[0].text : undefined,
    errorText: error
  }

  const state =
    status === 'completed'
      ? error
        ? 'output-error'
        : 'output-available'
      : 'input-available'
  return (
    <Tool defaultOpen={false}>
      <ToolHeader
        state={state}
        type={toolCall.type}
      />
      <ToolContent>
        <ToolInput input={toolCall.input} />
        <ToolOutput
          errorText={toolCall.errorText}
          output={<MarkdownRender>{toolCall.output}</MarkdownRender>}
        />
      </ToolContent>
    </Tool>
  )
}

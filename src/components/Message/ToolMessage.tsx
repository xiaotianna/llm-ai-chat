import MarkdownRender from '../MarkdownRender'
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput
} from '../ui/shadcn-io/ai/tool'

// AI调用工具的消息
export const ToolMessage = ({
  id,
  content,
  tool_name,
  isDone = false
}: {
  id: string
  content: string
  tool_name: string
  isDone?: boolean
}) => {
  const { input, output, error } = JSON.parse(content)
  const toolCall = {
    type: tool_name,
    toolCallId: id,
    input: input,
    output: output ? '```json\n' + output[0].text : undefined,
    errorText: error
  }

  const state = isDone
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

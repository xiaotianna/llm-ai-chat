'use client'
import {
  BotIcon,
  SparklesIcon,
  DatabaseIcon,
  ShieldIcon,
  FileTextIcon,
  ServerIcon,
  DeepThinkIcon,
  ZapIcon
} from '@/components/icon/feature-icons'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { ReactNode } from 'react'
import { Card } from './ui/card'
import FrostedGlassIcon from './icon/frosted-glass-icon'

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  accentColor?: string
}

const FeatureCard = ({
  icon,
  title,
  description,
  accentColor = 'rgba(120, 120, 255, 0.5)'
}: FeatureCardProps) => {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const adjustedAccentColor = isDark
    ? accentColor.replace(
        /rgba$$(\d+),\s*(\d+),\s*(\d+),\s*[\d.]+$$/,
        'rgba($1, $2, $3, 0.3)'
      )
    : accentColor

  return (
    <motion.div
      className='relative group h-full'
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, margin: '-100px' }}
    >
      <Card className='h-full overflow-hidden bg-background/60 backdrop-blur-sm border transition-all duration-300 hover:shadow-lg dark:bg-background/80'>
        <div className='p-6 h-full flex flex-col relative z-10'>
          <FrostedGlassIcon
            icon={icon}
            color={accentColor}
            className='mb-4 self-start'
          />

          <h3 className='text-lg font-bold mb-2 dark:text-white'>{title}</h3>
          <p className='text-muted-foreground flex-grow'>{description}</p>
        </div>
        <motion.div
          className='absolute inset-0 z-0 opacity-20 dark:opacity-30'
          initial={{ opacity: 0 }}
          animate={{
            background: [
              `radial-gradient(circle at 30% 30%, ${adjustedAccentColor} 0%, transparent 60%)`,
              `radial-gradient(circle at 70% 70%, ${adjustedAccentColor} 0%, transparent 60%)`
            ],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: 'reverse',
            ease: 'easeInOut'
          }}
        />
      </Card>
    </motion.div>
  )
}

const FeaturesSection = () => {
  const features = [
    {
      icon: <BotIcon />,
      title: 'Advanced LLM Capabilities',
      description:
        '大模型对话、图片生成、AI Coding & 代码在线编辑运行等功能',
      accentColor: 'rgba(36, 101, 237, 0.5)'
    },
    {
      icon: <SparklesIcon />,
      title: 'Multi-Model Intelligence',
      description:
        '支持多种模型进行智能处理，如 DeepSeek-R1、通义千问、智谱等',
      accentColor: 'rgba(236, 72, 153, 0.5)'
    },
    {
      icon: <FileTextIcon />,
      title: 'Contextual Dialogue',
      description:
        '支持多轮对话，用户可以在交互过程中保留聊天历史，提供上下文信息',
      accentColor: 'rgba(249, 115, 22, 0.5)'
    },
    {
      icon: <ShieldIcon />,
      title: 'Github OAuth Login',
      description:
        '集成Github OAuth 登录，省去繁琐的登录注册流程，体验更加便捷，更安全可靠',
      accentColor: 'rgba(132, 204, 22, 0.5)'
    },
    {
      icon: <DatabaseIcon />,
      title: 'Supabase Data Cloud Storage',
      description:
        '采用 Supabase 做云存储支持，更加安全，更便捷，更可靠',
      accentColor: 'rgba(34, 211, 238, 0.5)'
    },
    {
      icon: <ServerIcon />,
      title: 'MCP Server',
      description:
        '配置您自己的 MCP 服务器以提升性能和控制，让回答更精准',
      accentColor: 'rgba(168, 85, 247, 0.5)'
    },
    {
      icon: <DeepThinkIcon />,
      title: 'Deep Think',
      description:
        'AI深度推理，多步骤任务处理，提供精准分析和解决方案',
      accentColor: 'rgba(143, 36, 251, 0.5)'
    },
    {
      icon: <ZapIcon />,
      title: 'Open Router & 硅基流动',
      description:
        'Open Router和硅基流动提供 AI 模型接口，更加稳定',
      accentColor: 'rgba(16, 185, 129, 0.5)'
    }
  ]

  return (
    <section
      className='py-20 bg-muted/50 dark:bg-transparent mx-auto'
      id='features'
      aria-labelledby='features-heading'
    >
      <div className='container px-4 md:px-6'>
        <div className='flex flex-col items-center justify-center space-y-4 text-center mb-12'>
          <div className='space-y-2'>
            <div className='inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground mb-2'>
              主要特点
            </div>
            <h2
              id='features-heading'
              className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl'
            >
              Exclusive AI Platform 专属AI平台
            </h2>
            <p className='mx-auto max-w-[700px] text-muted-foreground md:text-xl'>
              为更简单、高效、智能的AI服务，我们提供了以下功能
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              accentColor={feature.accentColor}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection

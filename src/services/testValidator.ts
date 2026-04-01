import type { IStory } from '../data/stories'
import { testStories, commonTestStories } from '../data/stories.test'
import { commonTestStories as commonStories } from '../data/stories.common'

// 验证测试用例的完整性
export function validateTestStories(): void {
  console.log('=== 验证测试用例 ===')

  // 验证测试用例数量
  console.log(`测试用例总数: ${testStories.length + commonStories.length}`)

  // 验证每个测试用例
  const allStories = [...testStories, ...commonStories]

  allStories.forEach((story, index) => {
    const isValid = validateStory(story)
    console.log(`[${index + 1}/${allStories.length}] ${story.title}: ${isValid ? '✅ 有效' : '❌ 无效'}`)

    if (!isValid) {
      console.log(`  问题: ${story.surface}`)
      console.log(`  答案: ${story.bottom}`)
    }
  })

  // 统计结果
  const validCount = allStories.filter(story => validateStory(story)).length
  const invalidCount = allStories.length - validCount

  console.log(`\n=== 验证结果 ===`)
  console.log(`有效测试用例: ${validCount}`)
  console.log(`无效测试用例: ${invalidCount}`)
  console.log(`总通过率: ${((validCount / allStories.length) * 100).toFixed(1)}%`)
}

// 验证单个故事
function validateStory(story: IStory): boolean {
  // 检查必需字段
  if (!story.id || !story.title || !story.difficulty || !story.surface || !story.bottom) {
    return false
  }

  // 检查字段类型
  if (typeof story.id !== 'string' ||
      typeof story.title !== 'string' ||
      typeof story.difficulty !== 'string' ||
      typeof story.surface !== 'string' ||
      typeof story.bottom !== 'string') {
    return false
  }

  // 检查故事逻辑
  const surface = story.surface.toLowerCase()
  const bottom = story.bottom.toLowerCase()

  // 检查汤面和汤底的一致性
  if (surface.includes('掌声') && !bottom.includes('掌声')) {
    return false
  }

  if (surface.includes('观众') && !bottom.includes('观众')) {
    return false
  }

  if (surface.includes('手') && !bottom.includes('手')) {
    return false
  }

  if (surface.includes('拍') && !bottom.includes('拍')) {
    return false
  }

  // 检查汤底是否提供了明确的答案
  if (story.bottom.includes('没有手') || story.bottom.includes('没有拍') || story.bottom.includes('预录掌声')) {
    return true
  }

  if (story.bottom.includes('有手') || story.bottom.includes('鼓掌') || story.bottom.includes('拍手')) {
    return true
  }

  return false
}

// 运行验证
if (require.main === module) {
  validateTestStories()
}
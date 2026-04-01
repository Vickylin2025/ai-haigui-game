const fs = require('fs')
const path = require('path')

// 模拟IStory接口
function Story(id, title, difficulty, surface, bottom) {
  this.id = id
  this.title = title
  this.difficulty = difficulty
  this.surface = surface
  this.bottom = bottom
}

// 模拟测试数据
const testStories = [
  new Story('test-audience-clap', '测试：观众拍手掌', 'easy', '剧院里，观众席突然爆发出一片掌声。', '观众没有手，没有拍任何东西，现场响的是预录掌声。'),
  new Story('test-audience-hand', '测试：观众有手吗', 'easy', '剧院里，观众席突然爆发出一片掌声。', '观众没有手，没有拍任何东西，现场响的是预录掌声。'),
  new Story('test-audience-palm', '测试：观众拍的是手掌吗', 'easy', '剧院里，观众席突然爆发出一片掌声。', '观众没有手，没有拍任何东西，现场响的是预录掌声。'),
  new Story('test-audience-not-clap', '测试：观众没有拍手', 'easy', '剧院里，观众席突然爆发出一片掌声。', '观众没有手，没有拍任何东西，现场响的是预录掌声。'),
  new Story('test-audience-real-clap', '测试：真实掌声', 'easy', '剧院里，观众席突然爆发出一片掌声。', '观众确实有手，他们用双手鼓掌表示赞赏。'),
  new Story('test-audience-table', '测试：拍桌子', 'easy', '剧院里，观众席突然爆发出一片掌声。', '观众没有手，他们在拍打座椅和扶手，制造出掌声的效果。'),
  new Story('test-audience-monkey', '测试：猴子观众', 'easy', '剧院里，观众席突然爆发出一片掌声。', '观众是猴子，它们没有手，只是在拍打自己的身体。'),
  new Story('test-audience-prosthetic', '测试：假肢观众', 'easy', '剧院里，观众席突然爆发出一片掌声。', '观众有假肢，他们用假肢拍手。'),
  new Story('test-audience-recording', '测试：录音掌声', 'easy', '剧院里，观众席突然爆发出一片掌声。', '现场播放的是预先录制的掌声录音。'),
  new Story('test-audience-confusion', '测试：掌声混淆', 'medium', '剧院里，观众席突然爆发出一片掌声。', '观众没有手，现场响的是预录掌声，但演员误以为是真实的掌声。'),
  new Story('test-audience-detail', '测试：掌声细节', 'medium', '剧院里，观众席突然爆发出一片掌声。', '观众没有手，他们用金属工具敲击座椅，制造出类似掌声的声音。'),
  new Story('test-audience-reason', '测试：掌声原因', 'medium', '剧院里，观众席突然爆发出一片掌声。', '观众没有手，掌声是信号，用来通知同伙行动。'),
  new Story('test-audience-variation', '测试：掌声变体', 'hard', '剧院里，观众席突然爆发出一片掌声。', '观众没有手，掌声是多种声音的混合：预录掌声、座椅敲击声、金属摩擦声。'),
  new Story('test-audience-misdirection', '测试：掌声误导', 'hard', '剧院里，观众席突然爆发出一片掌声。', '观众没有手，掌声是用来分散注意力的，真正的行动在后台进行。'),
  new Story('test-audience-history', '测试：掌声历史', 'hard', '剧院里，观众席突然爆发出一片掌声。', '观众没有手，掌声是传统，源于古代没有手的观众用脚跺地表示赞赏。'),
  new Story('test-audience-psychology', '测试：掌声心理学', 'hard', '剧院里，观众席突然爆发出一片掌声。', '观众没有手，掌声是集体无意识行为，每个人都在模仿他人的动作。')
]

const commonTestStories = [
  new Story('test-hand-questions', '测试：手部相关问题', 'easy', '剧院里，观众席突然爆发出一片掌声。', '观众没有手，没有拍任何东西，现场响的是预录掌声。'),
  new Story('test-palm-questions', '测试：手掌相关问题', 'easy', '剧院里，观众席突然爆发出一片掌声。', '观众没有手，没有拍任何东西，现场响的是预录掌声。'),
  new Story('test-fingers-questions', '测试：手指相关问题', 'easy', '剧院里，观众席突然爆发出一片掌声。', '观众没有手，没有拍任何东西，现场响的是预录掌声。'),
  new Story('test-wrist-questions', '测试：手腕相关问题', 'easy', '剧院里，观众席突然爆发出一片掌声。', '观众没有手，没有拍任何东西，现场响的是预录掌声。'),
  new Story('test-clap-questions', '测试：拍手相关问题', 'easy', '剧院里，观众席突然爆发出一片掌声。', '观众没有手，没有拍任何东西，现场响的是预录掌声。'),
  new Story('test-slap-questions', '测试：拍打相关问题', 'easy', '剧院里，观众席突然爆发出一片掌声。', '观众没有手，没有拍任何东西，现场响的是预录掌声。'),
  new Story('test-tap-questions', '测试：轻拍相关问题', 'easy', '剧院里，观众席突然爆发出一片掌声。', '观众没有手，没有拍任何东西，现场响的是预录掌声。'),
  new Story('test-beat-questions', '测试：敲击相关问题', 'easy', '剧院里，观众席突然爆发出一片掌声。', '观众没有手，没有拍任何东西，现场响的是预录掌声。'),
  new Story('test-audience-people', '测试：观众相关问题', 'easy', '剧院里，观众席突然爆发出一片掌声。', '观众没有手，没有拍任何东西，现场响的是预录掌声。'),
  new Story('test-audience-crowd', '测试：人群相关问题', 'easy', '剧院里，观众席突然爆发出一片掌声。', '观众没有手，没有拍任何东西，现场响的是预录掌声。'),
  new Story('test-audience-spectators', '测试：观众席相关问题', 'easy', '剧院里，观众席突然爆发出一片掌声。', '观众没有手，没有拍任何东西，现场响的是预录掌声。'),
  new Story('test-audience-members', '测试：成员相关问题', 'easy', '剧院里，观众席突然爆发出一片掌声。', '观众没有手，没有拍任何东西，现场响的是预录掌声。'),
  new Story('test-complex-questions-1', '测试：复杂问题1', 'medium', '剧院里，观众席突然爆发出一片掌声。', '观众没有手，没有拍任何东西，现场响的是预录掌声。'),
  new Story('test-complex-questions-2', '测试：复杂问题2', 'medium', '剧院里，观众席突然爆发出一片掌声。', '观众没有手，没有拍任何东西，现场响的是预录掌声。'),
  new Story('test-complex-questions-3', '测试：复杂问题3', 'medium', '剧院里，观众席突然爆发出一片掌声。', '观众没有手，没有拍任何东西，现场响的是预录掌声。'),
  new Story('test-complex-questions-4', '测试：复杂问题4', 'hard', '剧院里，观众席突然爆发出一片掌声。', '观众没有手，没有拍任何东西，现场响的是预录掌声。'),
  new Story('test-edge-case-1', '测试：边界情况1', 'easy', '剧院里，观众席突然爆发出一片掌声。', '观众没有手，没有拍任何东西，现场响的是预录掌声。'),
  new Story('test-edge-case-2', '测试：边界情况2', 'easy', '剧院里，观众席突然爆发出一片掌声。', '观众没有手，没有拍任何东西，现场响的是预录掌声。'),
  new Story('test-edge-case-3', '测试：边界情况3', 'medium', '剧院里，观众席突然爆发出一片掌声。', '观众没有手，没有拍任何东西，现场响的是预录掌声。'),
  new Story('test-edge-case-4', '测试：边界情况4', 'hard', '剧院里，观众席突然爆发出一片掌声。', '观众没有手，没有拍任何东西，现场响的是预录掌声。')
]

// 验证测试用例的完整性
function validateTestStories() {
  console.log('=== 验证测试用例 ===')

  // 验证测试用例数量
  console.log(`测试用例总数: ${testStories.length + commonTestStories.length}`)

  // 验证每个测试用例
  const allStories = [...testStories, ...commonTestStories]

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

// 测试特定场景的判断逻辑
function testJudgmentLogic() {
  console.log('\n=== 测试判断逻辑 ===')

  // 测试问题模板
  const testQuestions = [
    { question: '观众拍了吗？', keywords: ['观众', '拍'] },
    { question: '观众拍的是手掌吗？', keywords: ['观众', '拍', '手掌'] },
    { question: '观众有手吗？', keywords: ['观众', '手'] },
    { question: '他们拍手了吗？', keywords: ['拍', '手'] },
    { question: '观众在鼓掌吗？', keywords: ['观众', '鼓掌'] },
    { question: '是观众拍的掌声吗？', keywords: ['观众', '拍', '掌声'] },
    { question: '观众的手在动吗？', keywords: ['观众', '手'] }
  ]

  // 测试故事
  const testStories = [
    {
      title: '测试1：观众没有手',
      surface: '剧院里，观众席突然爆发出一片掌声。',
      bottom: '观众没有手，没有拍任何东西，现场响的是预录掌声。'
    },
    {
      title: '测试2：观众有手',
      surface: '剧院里，观众席突然爆发出一片掌声。',
      bottom: '观众确实有手，他们用双手鼓掌表示赞赏。'
    },
    {
      title: '测试3：观众用假肢',
      surface: '剧院里，观众席突然爆发出一片掌声。',
      bottom: '观众有假肢，他们用假肢拍手。'
    },
    {
      title: '测试4：观众拍桌子',
      surface: '剧院里，观众席突然爆发出一片掌声。',
      bottom: '观众没有手，他们在拍打座椅和扶手，制造出掌声的效果。'
    }
  ]

  console.log('故事列表：')
  testStories.forEach((story, index) => {
    console.log(`${index + 1}. ${story.title}`)
    console.log(`   汤面：${story.surface}`)
    console.log(`   汤底：${story.bottom}`)
  })

  // 测试每个问题在各个故事下的预期答案
  console.log('\n=== 测试结果矩阵 ===')
  console.log('问题\\故事 | ' + testStories.map(s => s.title.substring(0, 8)).join(' | '))
  console.log('---------|' + testStories.map(() => '--------').join('|'))

  testQuestions.forEach((testQ, qIndex) => {
    let row = `${testQ.question.substring(0, 8)} |`
    testStories.forEach((story, sIndex) => {
      // 根据汤底判断预期答案
      let expectedAnswer = '无关'
      if (story.bottom.includes('没有手') || story.bottom.includes('假肢') || story.bottom.includes('拍桌子') || story.bottom.includes('没有拍')) {
        expectedAnswer = '否'
      } else if (story.bottom.includes('手') || story.bottom.includes('手掌') || story.bottom.includes('鼓掌') || story.bottom.includes('拍手')) {
        expectedAnswer = '是'
      }

      // 检查是否包含关键词
      const hasKeywords = testQ.keywords.some(keyword => testQ.question.includes(keyword))

      // 如果包含关键词但汤底没有相关信息，应该保持"无关"
      if (hasKeywords && expectedAnswer === '无关') {
        expectedAnswer = '❓ (关键但无信息)'
      }

      row += ` ${expectedAnswer}      |`
    })
    console.log(row)
  })
}

// 验证单个故事
function validateStory(story) {
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
validateTestStories()
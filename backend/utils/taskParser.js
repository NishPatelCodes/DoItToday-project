/**
 * AI-powered Task Parser
 * Analyzes text and extracts actionable tasks
 */

/**
 * Parse text into individual tasks using AI or smart parsing
 * This function detects:
 * - Bullet points (-, *, •)
 * - Numbered lists (1., 2., etc.)
 * - Action sentences (verbs at start)
 * - Multi-step instructions
 * - Lines that look like tasks
 */
export const parseTextToTasks = async (text) => {
  if (!text || typeof text !== 'string') {
    return [];
  }

  // Split text into lines
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  const tasks = [];
  const processedLines = new Set();

  for (let line of lines) {
    // Skip if already processed
    if (processedLines.has(line)) continue;

    // Clean the line
    line = cleanTaskLine(line);

    // Skip empty or very short lines
    if (line.length < 3) continue;

    // Skip lines that are clearly not tasks (headers, dates, etc.)
    if (isNotATask(line)) continue;

    // Extract task from line
    const task = extractTaskFromLine(line);
    if (task) {
      tasks.push(task);
      processedLines.add(line);
    }
  }

  // If we got tasks, return them
  if (tasks.length > 0) {
    return tasks;
  }

  // Fallback: try to split by sentences if no clear tasks found
  return extractTasksFromSentences(text);
};

/**
 * Clean a line to extract task content
 */
const cleanTaskLine = (line) => {
  // Remove bullet points and numbering
  line = line.replace(/^[-*•]\s*/, ''); // Remove bullet
  line = line.replace(/^\d+[.)]\s*/, ''); // Remove numbering (1., 2., etc.)
  line = line.replace(/^[a-z][.)]\s*/i, ''); // Remove letter numbering (a., b., etc.)
  line = line.replace(/^[ivx]+[.)]\s*/i, ''); // Remove roman numerals
  
  // Remove common prefixes
  line = line.replace(/^(todo|task|action|item|step|do|need to|should|must):?\s*/i, '');
  
  // Trim whitespace
  line = line.trim();
  
  return line;
};

/**
 * Check if a line is clearly not a task
 */
const isNotATask = (line) => {
  const lowerLine = line.toLowerCase();
  
  // Skip headers
  if (line.length < 20 && (line.includes(':') || line.match(/^[A-Z\s]+$/))) {
    return true;
  }
  
  // Skip dates
  if (line.match(/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/)) {
    return true;
  }
  
  // Skip time
  if (line.match(/^\d{1,2}:\d{2}/)) {
    return true;
  }
  
  // Skip email addresses
  if (line.includes('@') && line.includes('.')) {
    return true;
  }
  
  // Skip URLs
  if (line.match(/https?:\/\//)) {
    return true;
  }
  
  // Skip very short lines that are likely headers
  if (line.length < 10 && !line.includes(' ')) {
    return true;
  }
  
  return false;
};

/**
 * Extract task from a single line
 */
const extractTaskFromLine = (line) => {
  // Must have at least 3 characters
  if (line.length < 3) return null;

  // Check if it looks like an action (starts with verb or action word)
  const actionWords = [
    'review', 'send', 'update', 'create', 'write', 'read', 'check', 'complete',
    'finish', 'start', 'prepare', 'schedule', 'call', 'meet', 'discuss',
    'analyze', 'design', 'develop', 'test', 'fix', 'improve', 'implement',
    'organize', 'plan', 'research', 'study', 'learn', 'practice', 'build',
    'deploy', 'install', 'configure', 'setup', 'clean', 'buy', 'purchase',
    'return', 'visit', 'attend', 'submit', 'apply', 'register', 'sign',
    'upload', 'download', 'share', 'publish', 'edit', 'delete', 'remove',
    'add', 'remove', 'change', 'modify', 'replace', 'upgrade', 'downgrade'
  ];

  const lowerLine = line.toLowerCase();
  const firstWord = lowerLine.split(' ')[0];
  
  // Check if starts with action word
  const isAction = actionWords.some(word => firstWord.startsWith(word));
  
  // Or check if it's imperative (capitalized first letter or common task pattern)
  const isImperative = /^[A-Z]/.test(line) || 
                       lowerLine.includes('need to') ||
                       lowerLine.includes('should') ||
                       lowerLine.includes('must') ||
                       lowerLine.includes('have to');

  if (isAction || isImperative || line.length > 10) {
    // Determine priority based on keywords
    let priority = 'medium';
    if (lowerLine.includes('urgent') || lowerLine.includes('asap') || 
        lowerLine.includes('important') || lowerLine.includes('critical')) {
      priority = 'high';
    } else if (lowerLine.includes('optional') || lowerLine.includes('later') ||
               lowerLine.includes('someday') || lowerLine.includes('maybe')) {
      priority = 'low';
    }

    // Extract title (first 100 characters or until period)
    let title = line;
    if (title.length > 100) {
      title = title.substring(0, 97) + '...';
    }
    // Remove trailing period if it's the only one
    if (title.endsWith('.') && title.split('.').length === 2) {
      title = title.slice(0, -1);
    }

    return {
      title: title.trim(),
      description: line.length > 100 ? line : '',
      priority: priority,
    };
  }

  return null;
};

/**
 * Fallback: Extract tasks from sentences if no clear tasks found
 */
const extractTasksFromSentences = (text) => {
  // Split by common sentence delimiters
  const sentences = text.split(/[.!?]\s+/).map(s => s.trim()).filter(s => s.length > 0);
  
  const tasks = [];
  for (const sentence of sentences) {
    const task = extractTaskFromLine(sentence);
    if (task) {
      tasks.push(task);
    }
  }
  
  return tasks;
};

/**
 * Use AI to parse tasks (if OpenAI API is available)
 * Falls back to smart parsing if AI is not available
 */
export const parseTextToTasksWithAI = async (text) => {
  // Check if OpenAI API key is available
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiApiKey) {
    // Fall back to smart parsing
    return parseTextToTasks(text);
  }

  try {
    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({ apiKey: openaiApiKey });

    const prompt = `Analyze the following text and extract all actionable tasks. Return a JSON array of tasks, where each task has:
- title: A clear, concise task title (required)
- description: Optional additional details
- priority: "low", "medium", or "high" based on urgency/importance

Text to analyze:
${text}

Return ONLY a valid JSON array, no other text. Example format:
[
  {"title": "Review project proposal", "description": "", "priority": "medium"},
  {"title": "Send email to client", "description": "Follow up on last meeting", "priority": "high"}
]`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a task extraction assistant. Extract actionable tasks from text and return them as a JSON array.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      return parseTextToTasks(text); // Fallback
    }

    // Try to extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const tasks = JSON.parse(jsonMatch[0]);
      // Validate and clean tasks
      return tasks
        .filter(task => task && task.title)
        .map(task => ({
          title: task.title.trim(),
          description: (task.description || '').trim(),
          priority: ['low', 'medium', 'high'].includes(task.priority?.toLowerCase()) 
            ? task.priority.toLowerCase() 
            : 'medium',
        }));
    }

    // If JSON parsing fails, fall back to smart parsing
    return parseTextToTasks(text);
  } catch (error) {
    console.error('AI parsing error:', error);
    // Fall back to smart parsing
    return parseTextToTasks(text);
  }
};

export default {
  parseTextToTasks,
  parseTextToTasksWithAI,
};


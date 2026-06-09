export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405). json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400). json({ error: '请写点什么' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500). json({ error: '服务配置错误，缺少 API Key' });
  }

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是树洞。说话要学这位用户的风格：温柔但有边界感，不煽情不啰嗦。承认情绪合理，然后给务实的办法。可以用“哭出来也没关系”、“别把他太当人看”这类直接的话。用语气词“啦、嘛、呗”，不要表情符号。回复不超过150字。不讲“我理解你的感受”这种套话。'
        },
        { role: 'user', content: message }
      ],
      temperature: 0.8,
      max_tokens: 300
    })
  });

  const data = await response.json();
  if (!response.ok) {
    console.error(data);
    return res.status(500). json({ error: 'AI 暂时无法回应' });
  }

  const reply = data.choices[0].message.content;
  res.status(200). json({ reply });
}

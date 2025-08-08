import React, { useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

function RagChat() {
  const [query, setQuery] = useState('');
  const [responseText, setResponseText] = useState('');
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);

  const {
    siteConfig: { customFields },
  } = useDocusaurusContext();
  const GEMINI_API_KEY = customFields.geminiApiKey;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponseText('');
    try {
      const candidateLinks = await fetchCandidateLinks(query);
      setCandidates(candidateLinks);
      const ragResponse = await generateRagResponse(query, candidateLinks);
      setResponseText(ragResponse);
    } catch (error) {
      console.error('Error during RAG process:', error);
      setResponseText('エラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  async function fetchCandidateLinks(query) {
    const response = await fetch('http://ootomo39.xsrv.jp/api/search.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!response.ok) throw new Error('Candidate search failed');
    const data = await response.json();
    return data.candidates;
  }

  async function generateRagResponse(query, candidates) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `質問: ${query}\n候補文献:\n${candidates
                    .map((c, i) => `${i + 1}. ${c.file_path}\n---\n${c.content.substring(0, 200)}...`)
                    .join('\n\n')}`,
                },
              ],
            },
          ],
        }),
      }
    );
    if (!response.ok) throw new Error('Response generation failed');
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '回答なし';
  }

  return (
    <div style={{ padding: '1em', maxWidth: '800px', margin: '0 auto' }}>
      <h2>RAG チャットツール</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          placeholder="質問を入力してください..."
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: '80%', padding: '0.5em' }}
        />
        <button type="submit" style={{ padding: '0.5em 1em', marginLeft: '0.5em' }}>
          送信
        </button>
      </form>
      {loading && <p>回答を生成中...</p>}
      {responseText && (
        <div style={{ marginTop: '1em', padding: '1em', background: '#f0f0f0' }}>
          <strong>回答:</strong>
          <p>{responseText}</p>
        </div>
      )}
      {candidates.length > 0 && (
        <div style={{ marginTop: '1em' }}>
          <h3>関連記事候補</h3>
          <ul>
            {candidates.map((item, idx) => (
              <li key={idx}>
                <a
                  href={`http://ootomo39.xsrv.jp/storage/${item.file_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.file_path}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default RagChat;

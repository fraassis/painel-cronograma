// Arquivo: api/gemini.js
// Esta é a sua Serverless Function. Ela roda escondida nos servidores da Vercel.

export default async function handler(req, res) {
    // 1. Bloqueia acessos indevidos (só aceita método POST do seu painel)
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    // 2. Recebe a pergunta do seu HTML
    const { userQuery, systemPrompt } = req.body;
    
    // 3. Pega a chave secreta que guardaremos na Vercel
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Chave da API não configurada no servidor.' });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    try {
        // 4. Faz a requisição segura para o Google
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userQuery }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: { temperature: 0.3 }
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.message || "Erro na API do Google");
        }

        // 5. Devolve só a resposta pronta para o seu HTML
        res.status(200).json(data);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

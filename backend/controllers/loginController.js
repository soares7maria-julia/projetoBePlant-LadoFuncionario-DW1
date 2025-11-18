const { query } = require('../database');

// ================== LOGIN FUNCIONÁRIO ==================
exports.login = async (req, res) => {
  try {
   
    const { email, senha } = req.body;
    
 console.log("Tentando login com:", email, senha);

    // Validação simples
    if (!email || !senha) {
      return res.status(400).json({ erro: "Email e senha são obrigatórios." });
    }

    // Verifica se a pessoa existe e é um funcionário
    const result = await query(
      `SELECT p.idpessoa, p.nomepessoa, p.emailpessoa
       FROM pessoa p
       INNER JOIN funcionario f ON f.idpessoa = p.idpessoa
       WHERE p.emailpessoa = $1 AND p.senhapessoa = $2`,
      [email, senha]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        sucesso: false,
        erro: "Usuário não encontrado ou não é funcionário."
      });
    }

    const usuario = result.rows[0];

    // Cria cookie com os dados do usuário logado
    res.cookie("usuarioLogado", JSON.stringify(usuario), {
      httpOnly: false, // o front pode ler o cookie
      maxAge: 24 * 60 * 60 * 1000, // 1 dia
      path: "/"
    });

    // Retorna também no corpo da resposta
    res.json({
      sucesso: true,
      usuario
    });

  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ erro: "Erro interno ao tentar login." });
  }
};

// ================== LOGOUT ==================
exports.logout = (req, res) => {
  res.clearCookie("usuarioLogado");
  res.json({
    sucesso: true,
    mensagem: "Logout realizado com sucesso."
  });
};

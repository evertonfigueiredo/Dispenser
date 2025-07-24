import fetch from "node-fetch";

const ESP_IP = process.env.ESP_IP;

const getStatus = async (req, res) => {
  try {
    if (process.env.NODE_ENV === "development") {
      const status = {
        estado: "ligado",
      };
      return res.status(200).json({
        statusCode: 200,
        data: status,
      });
    }

    const response = await fetch(`${ESP_IP}/status`);
    const status = await response.json();

    res.status(200).json({
      statusCode: 200,
      data: status,
    });

  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: "Erro ao consultar status do ESP",
      error: error.message,
    });
  }
};


const sendCommand = async (req, res) => {
  const { command } = req.body;

  if (!["ligar", "desligar"].includes(command)) {
    return res.status(400).json({
      statusCode: 400,
      message: "Comando inválido"
    });
  }

  try {
    if (process.env.NODE_ENV === "development") {
      return res.status(200).json({
        statusCode: 200,
        message: `Mock: comando '${command}' executado`,
        data: { estado: command === "ligar" ? "ligadooooo" : "desligado" }
      });
    }

    const response = await fetch(`${ESP_IP}/${command}`);
    const status = await response.json();

    res.status(200).json({
      statusCode: 200,
      message: `Comando '${command}' enviado com sucesso.`,
      data: status
    });

  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: "Erro ao enviar comando ao ESP",
      error: error.message
    });
  }
};


export default {
  getStatus,
  sendCommand,
};

import fetch from "node-fetch";

const ESP_IP = process.env.ESP_IP;

const getStatus = async (req, res) => {
  try {
    if (process.env.NODE_ENV === "development") {
      const mockStatus = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        status: "off"
      }));

      return res.status(200).json({
        statusCode: 200,
        data: mockStatus,
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
  const { command, id } = req.body;
  
  if (!["ligar", "desligar"].includes(command) || typeof id !== "number") {
    return res.status(400).json({
      statusCode: 400,
      message: "Comando inválido ou ID ausente/inválido"
    });
  }

  try {
    if (process.env.NODE_ENV === "development") {
      return res.status(200).json({
        statusCode: 200,
        message: `Mock: comando '${command}' executado para o ID ${id}`,
        data: {
          id,
          status: command === "ligar" ? "on" : "off"
        }
      });
    }

    const response = await fetch(`${ESP_IP}/${command}?id=${id}`);
    const status = await response.json(); // espera: { id, status }

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

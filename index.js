const venom = require("venom-bot");
const express = require("express");
const { body, validationResult } = require("express-validator");
const { phoneNumberFormatter } = require("./helpers/index");
const app = express();
const port = 3000;
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
venom
  .create(
    "venomBot",
    asciiQR => {
      console.log("Terminal qrcode: ");
    },
    statusSession => {
      console.log("Status Session: ", statusSession); //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled
    },
    {
      folderNameToken: "tokens", //folder name when saving tokens
      mkdirFolderToken: "", //folder directory tokens, just inside the venom folder, example:  { mkdirFolderToken: '/node_modules', } //will save the tokens folder in the node_modules directory
      headless: true, // Headless chrome
      devtools: false, // Open devtools by default
      useChrome: true, // If false will use Chromium instance
      debug: false, // Opens a debug session
      logQR: true, // Logs QR automatically in terminal
      browserArgs: ["--no-sandbox"], // Parameters to be added into the chrome browser instance
      disableSpins: true, // Will disable Spinnies animation, useful for containers (docker) for a better log
      disableWelcome: true, // Will disable the welcoming message which appears in the beginning
      updatesLog: true, // Logs info updates automatically in terminal
      autoClose: 60000, // Automatically closes the venom-bot only when scanning the QR code (default 60 seconds, if you want to turn it off, assign 0 or false)
    }
  )
  .then(client => start(client))
  .catch(erro => {
    console.log(erro);
  });

function start(client) {
  app.get("/", (req, res) => {
    res.send({
      status: true,
      message: "Bot Running",
    });
  });
  app.post(
    "/sendText",
    [body("number").notEmpty(), body("message").notEmpty()],
    async (req, res) => {
      const errors = validationResult(req).formatWith(({ msg }) => {
        return msg;
      });
      if (!errors.isEmpty()) {
        return res.status(422).json({
          status: false,
          message: errors.mapped(),
        });
      }
      const { number, message, image, caption } = req.body;
      const formatterNumber = phoneNumberFormatter(number);
      await client
        .sendText(formatterNumber, message)
        .then(result => {
          res.status(200).json({
            status: true,
            response: result,
          });
          console.log(
            `{susccess: true,message : "pesan kirim ke ${number} : '${message}'"}`
          );
        })
        .catch(erro => {
          res.status(500).json({
            status: false,
            response: erro,
          });
        });
    }
  );
  app.post(
    "/sendPdf",
    [
      body("number").notEmpty(),
      body("message").notEmpty(),
      body("pdf").notEmpty(),
      body("caption").notEmpty(),
    ],
    async (req, res) => {
      const errors = validationResult(req).formatWith(({ msg }) => {
        return msg;
      });
      if (!errors.isEmpty()) {
        return res.status(422).json({
          status: false,
          message: errors.mapped(),
        });
      }
      const { number, message, pdf, caption } = req.body;
      const formatterNumber = phoneNumberFormatter(number);
      await client
        .sendFile(formatterNumber, pdf, "pdf-name", caption)
        .then(result => {
          res.status(200).json({
            status: true,
            response: result,
          });
          console.log(
            `{susccess: true,message : "pesan pdf kirim ke ${number} : '${message}'"}`
          );
        })
        .catch(erro => {
          res.status(500).json({
            status: false,
            response: erro,
          });
        });
    }
  );
  app.post(
    "/sendImage",
    [
      body("number").notEmpty(),
      body("message").notEmpty(),
      body("image").notEmpty(),
      body("caption").notEmpty(),
    ],
    async (req, res) => {
      const errors = validationResult(req).formatWith(({ msg }) => {
        return msg;
      });
      if (!errors.isEmpty()) {
        return res.status(422).json({
          status: false,
          message: errors.mapped(),
        });
      }
      const { number, message, image, caption } = req.body;
      const formatterNumber = phoneNumberFormatter(number);
      await client
        .sendImage(formatterNumber, image, "image-name", caption)
        .then(result => {
          res.status(200).json({
            status: true,
            response: result,
          });
          console.log(
            `{susccess: true,message : "pesan image kirim ke ${number} : '${message}'"}`
          );
        })
        .catch(erro => {
          res.status(500).json({
            status: false,
            response: erro,
          });
        });
    }
  );
}

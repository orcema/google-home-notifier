var googlehomenotifier = require('../')("192.168.178.131", "de-DE", 1);

googlehomenotifier.notify("Freue mich auf dich", function (result) {
  console.log(result);
})

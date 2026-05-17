const { Hospital } = require('./backend/models');
const { sequelize } = require('./backend/config/db');

async function check() {
  try {
    const hospitals = await Hospital.findAll();
    console.log(JSON.stringify(hospitals, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

check();

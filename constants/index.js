exports.PAGE_SIZE = 32;
exports.getOffset = (page) => (isNaN(page) ? 0 : (page - 1) * this.PAGE_SIZE);
exports.CANNOT_UPDATE_SUBSCRIPTION = "No puedes modificar una suscripción.";
exports.PURCHASE_NOT_FOUND = "Lo sentimos. No encontramos esta compra.";
exports.USER_NOT_FOUND = "Usuario no encontrado.";
exports.NOT_ALLOWED = "No tienes permisos para realizar esta acción.";
exports.castInt = (number) => (isNaN(parseInt(number)) ? number === "" || number === null || number === undefined ? null: 0 : parseInt(number));
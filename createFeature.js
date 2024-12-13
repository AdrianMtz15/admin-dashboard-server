const fs = require("fs");
const { exec } = require('child_process');

// revisar context e implementar los servicios

const isCamel = str => !str.match(/[\s_-]/g);

const camelToSnake = (str) => {
  return str.split(/\.?(?=[A-Z])/).join('_').toLowerCase();
}

const isSnakeCase = (varName) => {
  // firstly, check that input is a string or not.
  if (typeof varName !== 'string') {
    throw new TypeError('Argument is not a string.')
  }

  const pat = /(.*?)_([a-zA-Z])*/
  return pat.test(varName)
}

const snakeToCamel = (s) => {
  return s.replace(/([-_][a-z])/ig, ($1) => {
    return $1.toUpperCase()
      .replace('-', '')
      .replace('_', '');
  });
};

const capitalize = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const createDirIfNotExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const createActions = entityName => {
  const content = `
    const { ${entityName.toLowerCase()} } = require("../models");

    const findAll${capitalize(entityName)}s = async () => {
      const ${entityName.toLowerCase()}s = await ${entityName.toLowerCase()}.findAll();
      return ${entityName.toLowerCase()}s.map((current) => current.toJSON());
    };

    const find${capitalize(entityName)}sByParams = async params => {
      const ${entityName.toLowerCase()}s = await ${entityName.toLowerCase()}.findAll({ where: params });
      return ${entityName.toLowerCase()}s.map((current) => current.toJSON());
    }

    const find${capitalize(entityName)}ById = async (${entityName.toLowerCase()}_id) => {
      return findSingle${capitalize(entityName)}ByParams({ ${entityName.toLowerCase()}_id })
    };

    const findSingle${capitalize(entityName)}ByParams = async params => {
      const current_${entityName.toLowerCase()} = await ${entityName.toLowerCase()}.findOne({
        where: params,
      });
      if(current_${entityName.toLowerCase()} === null) return current_${entityName.toLowerCase()};
      return current_${entityName.toLowerCase()}.toJSON();
    }

    const create${capitalize(entityName)}FromData = async (data) => {
      delete data.${entityName.toLowerCase()}_id;
      const current_${entityName.toLowerCase()} = await ${entityName.toLowerCase()}.create(data);
      return current_${entityName.toLowerCase()}.toJSON();
    };

    const update${capitalize(entityName)}FromData = async (data) => {
      await ${entityName.toLowerCase()}.update(data, { where: { ${entityName.toLowerCase()}_id: data.${entityName.toLowerCase()}_id } });
      return find${capitalize(entityName)}ById(data.${entityName.toLowerCase()}_id);
    };

    const delete${capitalize(entityName)}ById = async (${entityName.toLowerCase()}_id) => {
      await ${entityName.toLowerCase()}.destroy({
        where: {
          ${entityName.toLowerCase()}_id,
        },
      });
    };

    module.exports = {
      findAll${capitalize(entityName)}s,
      find${capitalize(entityName)}ById,
      find${capitalize(entityName)}sByParams,
      findSingle${capitalize(entityName)}ByParams,
      create${capitalize(entityName)}FromData,
      update${capitalize(entityName)}FromData,
      delete${capitalize(entityName)}ById,
    };
    `;
  fs.writeFileSync(`./actions/${entityName}s.js`, content);
}

const createControllers = (entityName) => {
  const content= `
    const {
      find${capitalize(entityName)}ById,
      create${capitalize(entityName)}FromData,
      update${capitalize(entityName)}FromData,
      delete${capitalize(entityName)}ById,
      find${capitalize(entityName)}sByParams,
    } = require("../actions/${entityName.toLowerCase()}s");
    
    const get${capitalize(entityName)}s = async (req, res, next) => {
      try {
        const { query } = req;
        const ${entityName.toLowerCase()}s = await find${capitalize(entityName)}sByParams(query);
        res.status(200).send({ ${entityName.toLowerCase()}s });
      } catch (error) {
        next(error);
      }
    };
    
    const get${capitalize(entityName)}ById = async (req, res, next) => {
      try {
        const { ${entityName.toLowerCase()}_id } = req.params;
        const ${entityName.toLowerCase()} = await find${capitalize(entityName)}ById(${entityName.toLowerCase()}_id);
        res.status(200).send({ ${entityName.toLowerCase()} });
      } catch (error) {
        next(error);
      }
    };
    
    const create${capitalize(entityName)} = async (req, res, next) => {
      try {
        const data = req.body;
        const ${entityName.toLowerCase()} = await create${capitalize(entityName)}FromData(data);
        res.status(200).send({ ${entityName.toLowerCase()} });
      } catch (error) {
        next(error);
      }
    };
    
    const update${capitalize(entityName)} = async (req, res, next) => {
      try {
        const data = req.body;
        const ${entityName.toLowerCase()} = await update${capitalize(entityName)}FromData(data);
        res.status(200).send({ ${entityName.toLowerCase()} });
      } catch (error) {
        next(error);
      }
    };
    
    const delete${capitalize(entityName)} = async (req, res, next) => {
      try {
        const { ${entityName.toLowerCase()}_id } = req.params;
        await delete${capitalize(entityName)}ById(${entityName.toLowerCase()}_id);
        res.sendStatus(200);
      } catch (error) {
        next(error);
      }
    };
    
    module.exports = {
      get${capitalize(entityName)}s,
      get${capitalize(entityName)}ById,
      create${capitalize(entityName)},
      update${capitalize(entityName)},
      delete${capitalize(entityName)},
    };
  
  `;
  fs.writeFileSync(`./controllers/${entityName}s.js`, content);
};

const createRoutes = (entityName) => {
  const content = `
    const express = require("express");
    const {
      get${capitalize(entityName)}s,
      get${capitalize(entityName)}ById,
      create${capitalize(entityName)},
      update${capitalize(entityName)},
      delete${capitalize(entityName)},
    } = require("../controllers/${entityName.toLowerCase()}s");
    const { staffRoute } = require("../middleware/auth");
    const { isManager } = require("../middleware/admin");
    const router = express.Router();
    
    router.get("/", get${capitalize(entityName)}s);
    
    router.get("/:${entityName.toLowerCase()}_id", get${capitalize(entityName)}ById);
    
    router.post("/", [staffRoute, isManager], create${capitalize(entityName)});
    
    router.put("/", [staffRoute, isManager], update${capitalize(entityName)});
    
    router.delete("/:${entityName.toLowerCase()}_id", [staffRoute, isManager], delete${capitalize(entityName)});
    
    module.exports = router;  
  `;

  fs.writeFileSync(
    `./routes/${entityName.toLowerCase()}s.js`,
    content
  );
};

const createFiles = entityName => {
  createDirIfNotExists("./actions");
  createDirIfNotExists("./controllers");
  createDirIfNotExists("./routes");


  createActions(entityName);
  createControllers(entityName);
  createRoutes(entityName);

  console.log(`Feature '${entityName}' creada exitosamente.`);
}

const generateFeature = async (entityName) => {
  let modelName = entityName;
  if(isCamel(entityName)) {
    modelName = camelToSnake(modelName);
  }

  // exec(`sequelize model:generate --name ${modelName} --attributes ${modelName}_id:integer`, function(error) {
  //   if(error && error !== null) {
  //     throw error;
  //   }

    if(isSnakeCase(entityName)) {
      entityName = snakeToCamel(entityName);
    }

    createFiles(entityName);
  // });

};

if (process.length < 3) {
  console.error("Por favor, ingrese el nombre de una entidad.");
  process.exit(1);
}

const entityName = process.argv[2];

generateFeature(entityName);


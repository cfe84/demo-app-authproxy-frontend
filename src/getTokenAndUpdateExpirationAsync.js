const azure = require('azure-storage');
const uuidv1 = require('uuid/v1');

const TOKEN_TABLE = "tokens";
const USER_TABLE = "users";
const tableService = azure.createTableService();
const entGen = azure.TableUtilities.entityGenerator;

Date.prototype.addHours= function(h){
    this.setHours(this.getHours()+h);
    return this;
}

const createTableAsync = (tableName) => {
    return new Promise((resolve, reject) => {
        tableService.createTableIfNotExists(tableName, function(error, result, response) {
            if (!error) {
                resolve(result);
            } else {
                reject(error)
            }
          });
    })
}

const upsertEntityAsync = (tableName, entity) => {
    return new Promise((resolve, reject) => {
        tableService.insertOrReplaceEntity(tableName, entity, function(error, result, response) {
        if (!error) {
            resolve(result);
        } else {
            reject(error)
        }
      });
    });
}

const retrieveEntityAsync = (tableName, pk, rk) => {
    return new Promise((resolve, reject) => {
        tableService.retrieveEntity(tableName, pk, rk, function(error, result, response) {
        if (!error) {
            resolve(result);
        } else {
            reject(error)
        }
      });
    });
}

const getUserTokenAsync = async (userId) => {
    let tokenEntity, token; 
    try {
        tokenEntity = await retrieveEntityAsync(USER_TABLE, userId, "");
        token = tokenEntity.token._;        
    } catch (error) {
        // Does not exist
        token = uuidv1();
        tokenEntity = {
            PartitionKey: entGen.String(userId),
            RowKey: entGen.String(""),
            userId: entGen.String(userId),
            token: entGen.String(token)
        };
        await upsertEntityAsync(USER_TABLE, tokenEntity);
    }
    return token;
}

const upsertTokenAsync = async (token, userId) => {
    let expiry = (new Date()).addHours(2);
    const tokenEntity = {
        PartitionKey: entGen.String(token),
        RowKey: entGen.String(''),
        userId: entGen.String(userId),
        token: entGen.String(token),
        expiration: entGen.DateTime(expiry)
      };
    await upsertEntityAsync(TOKEN_TABLE, tokenEntity);
}

const getTokenAndUpdateExpirationAsync = async (userId) => {
    try {
        await createTableAsync(TOKEN_TABLE);
        await createTableAsync(USER_TABLE);
        const token = await getUserTokenAsync(userId);
        await upsertTokenAsync(token, userId);
        return token;
    } catch(error) {
        console.error(error);
        return null;
    }
}

module.exports = getTokenAndUpdateExpirationAsync;
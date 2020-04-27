const NormalModule = require('./NormalModule')

class NormalModuleFactory {

   static create(data) {
        return new NormalModule(data)
    }

}
module.exports = NormalModuleFactory
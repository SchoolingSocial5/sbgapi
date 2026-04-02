import mongoose from 'mongoose'

export class DatabaseService {
  public static async create(modelName: string, data: any) {
    const Model = mongoose.model(modelName)
    return await Model.create(data)
  }

  public static async findByIdAndUpdate(modelName: string, id: string, data: any, options: any = { new: true }) {
    const Model = mongoose.model(modelName)
    return await Model.findByIdAndUpdate(id, data, options)
  }

  public static async findByIdAndDelete(modelName: string, id: string) {
    const Model = mongoose.model(modelName)
    return await Model.findByIdAndDelete(id)
  }

  public static async findOneAndDelete(modelName: string, query: any) {
    const Model = mongoose.model(modelName)
    return await Model.findOneAndDelete(query)
  }

  public static async findOneAndUpdate(modelName: string, query: any, data: any, options: any = { new: true }) {
    const Model = mongoose.model(modelName)
    return await Model.findOneAndUpdate(query, data, options)
  }

  public static async deleteMany(modelName: string, query: any) {
    const Model = mongoose.model(modelName)
    return await Model.deleteMany(query)
  }

  public static async updateMany(modelName: string, query: any, update: any) {
    const Model = mongoose.model(modelName)
    return await Model.updateMany(query, update)
  }

  public static async findById(modelName: string, id: string) {
    const Model = mongoose.model(modelName)
    return await Model.findById(id)
  }

  public static async findOne(modelName: string, query: any = {}) {
    const Model = mongoose.model(modelName)
    return await Model.findOne(query)
  }
}

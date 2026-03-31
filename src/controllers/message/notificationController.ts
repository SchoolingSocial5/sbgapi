import { Request, Response } from 'express'
import { handleError } from '../../utils/errorHandler'
import {
  INotification,
  Notification,
} from '../../models/message/notificationModel'
import { queryData } from '../../utils/query'

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const result = await queryData<INotification>(Notification, req)
    const unread = await Notification.countDocuments({
      receiverUsername: req.query.receiverUsername,
      unread: true,
    })

    res.status(200).json({
      page: result.page,
      page_size: result.page_size,
      results: result.results,
      count: result.count,
      unread: unread,
    })
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const getNotification = async (req: Request, res: Response) => {
  try {
    const result = await Notification.findById(req.params.id)
    const unread = await Notification.countDocuments({ unread: true })
    res.status(200).json({ data: result, unread })
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const readNotifications = async (req: Request, res: Response) => {
  try {
    const ids = req.body.ids
    console.log(ids)
    await Notification.updateMany(
      { _id: { $in: ids } },
      { $set: { unread: false } }
    )

    const unread = await Notification.countDocuments({
      unread: true,
    })
    res.status(200).json({
      unread: unread,
    })
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

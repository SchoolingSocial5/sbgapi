import { Request, Response } from 'express'
import { handleError } from '../../utils/errorHandler'
import {
  queryData,
  deleteItem,
  updateItem,
  createItem,
} from '../../utils/query'
import {
  INotificationTemplate,
  NotificationTemplate,
} from '../../models/message/notificationTemplateModel'

//-----------------NOTIFICATION--------------------//
export const createNotificationTemplate = async (
  req: Request,
  res: Response
): Promise<void> => {
  createItem(
    req,
    res,
    NotificationTemplate,
    'Notification was created successfully'
  )
}

export const getNotificationTemplateById = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const item = await NotificationTemplate.findById(req.params.id)
    if (!item) {
      return res.status(404).json({ message: 'Notification not found' })
    }
    res.status(200).json({ data: item })
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const getNotificationTemplates = async (req: Request, res: Response) => {
  try {
    const result = await queryData<INotificationTemplate>(
      NotificationTemplate,
      req
    )
    res.status(200).json(result)
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const updateNotificationTemplate = async (
  req: Request,
  res: Response
) => {
  try {
    updateItem(
      req,
      res,
      NotificationTemplate,
      [],
      ['Notification not found', 'Notification was updated successfully']
    )
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const massDeleteNotificationTemplates = async (
  req: Request,
  res: Response
) => {
  try {
    for (let i = 0; i < req.body.length; i++) {
      const el = req.body[i]
      await NotificationTemplate.findByIdAndDelete(el._id)
    }

    const result = await queryData<INotificationTemplate>(
      NotificationTemplate,
      req
    )
    res.status(200).json({
      message: 'The notification templates are delted successfully.',
      result,
    })
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const deleteNotificationTemplate = async (
  req: Request,
  res: Response
) => {
  await deleteItem(req, res, NotificationTemplate, [], 'Notification not found')
}

import { Request, Response } from 'express'
import { Email, IEmail } from '../../models/message/emailModel'
import { handleError } from '../../utils/errorHandler'
import { queryData, createItem } from '../../utils/query'
import { sendEmail } from '../../utils/sendEmail'
import { User } from '../../models/users/userModel'

export const createEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  createItem(req, res, Email, 'Email was created successfully')
}

export const getEmailById = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const email = await Email.findById(req.params.id)
    if (!email) {
      return res.status(404).json({ message: 'Email not found' })
    }
    res.status(200).json(email)
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const getEmails = async (req: Request, res: Response) => {
  try {
    const result = await queryData<IEmail>(Email, req)
    res.status(200).json(result)
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const sendEmailToUsers = async (req: Request, res: Response) => {
  try {
    const users = req.body.selectedUsers
    const email = await Email.findById(req.params.id)

    if (!email) {
      return res.status(404).json({ message: 'Email template not found.' })
    }

    const failedUsers: { username: string; email: string; error: string }[] = []

    for (const user of users) {
      try {
        const isEmailSent = await sendEmail(
          String(user.username),
          user.email,
          email.name
        )

        if (!isEmailSent) {
          failedUsers.push({
            username: String(user.username),
            email: user.email,
            error: 'sendEmail returned false',
          })
        }
      } catch (err: any) {
        failedUsers.push({
          username: String(user.username),
          email: user.email,
          error: err.message || 'Unknown error',
        })
      }
    }

    if (failedUsers.length === 0) {
      return res.status(200).json({
        message: 'All emails sent successfully.',
        totalUsers: users.length,
      })
    } else {
      return res.status(207).json({
        message: 'Some emails failed to send.',
        failed: failedUsers,
        totalSuccess: users.length - failedUsers.length,
        totalFailed: failedUsers.length,
      })
    }
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const updateEmail = async (req: Request, res: Response) => {
  try {
    const email = await Email.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!email) {
      return res.status(404).json({ message: 'Email not found' })
    }

    const item = await queryData<IEmail>(Email, req)
    const { page, page_size, count, results } = item
    res.status(200).json({
      message: 'Email was updated successfully',
      results,
      count,
      page,
      page_size,
    })
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const deleteEmails = async (req: Request, res: Response) => {
  try {

    for (let i = 0; i < req.body.length; i++) {
      const el = req.body[i];
      await Email.findByIdAndDelete(el._id)
    }
    const result = await queryData<IEmail>(Email, req)
    res.status(200).json({ message: 'Emails deleted successfully', ...result })
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

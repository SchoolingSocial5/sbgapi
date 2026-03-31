import { Request, Response } from 'express'
import { handleError } from '../../utils/errorHandler'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '../../models/users/userModel'
import { sendEmail } from '../../utils/sendEmail'
dotenv.config()

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body
  try {
    const user = await User.findOne({ username }).select('+password')
    if (!user || !user.password) {
      res.status(404).json({
        message: 'Sorry user not found username or password, try again.',
      })
      return
    }

    if (user.isSuspended) {
      res.status(404).json({
        message: 'Sorry this account is suspended at the moment, please contact support.',
      })
      return
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      res
        .status(401)
        .json({ message: 'Sorry incorrect username or password, try again.' })
      return
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || '',
      { expiresIn: '30d' }
    )

    user.password = undefined

    res.status(200).json({
      message: 'Login successful',
      user,
      token,
    })
  } catch (error: unknown) {
    handleError(res, undefined, undefined, error)
  }
}

export const updatePassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { isTwoFactor, password, newPassword } = req.body
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      '+password'
    )
    if (!user) {
      res
        .status(404)
        .json({ message: 'Sorry incorrect email or password, try again.' })
      return
    }

    if (req.body.newPassword) {
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        res
          .status(401)
          .json({ message: 'Sorry incorrect password, try again.' })
        return
      }
      const updatePassword = await bcrypt.hash(newPassword, 10)

      await User.findOneAndUpdate(
        { username: req.params.username },
        { password: updatePassword }
      )
    } else {
      await User.findOneAndUpdate(
        { username: req.params.username },
        { isTwoFactor: req.body.isTwoFactor === 'true' ? true : false }
      )
    }

    res.status(200).json({
      message: req.body.newPassword
        ? 'Your password has been updated successfully.'
        : 'Your two factor authentication has been updated successfully.',
    })
  } catch (error: unknown) {
    handleError(res, undefined, undefined, error)
  }
}

export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as {
      userId: string
      email: string
    }

    const user = await User.findById(decoded.userId).select('-password')
    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    res.status(200).json({
      message: 'User fetched successfully',
      user,
    })
  } catch (error: unknown) {
    res.status(401).json({ message: 'Unauthorized', error })
  }
}

export const getAuthUser = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || '',
      { expiresIn: '30d' }
    )
    res.status(200).json({
      message: 'Login successful',
      user: user,
      token,
    })
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const forgottenPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body

  try {
    const resetCode = Math.floor(100000 + Math.random() * 900000)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000)
    const user = await User.findOneAndUpdate(
      { email },
      {
        passwordResetCode: resetCode,
        passwordExpiresAt: expiresAt,
      },
      { new: true }
    )

    if (user) {
      await sendEmail(user.username, email, 'forgotten_password', { resetCode })
    }

    res.status(200).json({
      message:
        'Please visit your email for the authentication code to reset your password.',
    })
  } catch (error: unknown) {
    handleError(res, undefined, undefined, error)
  }
}

export const validateResetCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, code } = req.body

  try {
    const user = await User.findOne({ email, passwordResetCode: code })
    if (
      !user ||
      !user.passwordExpiresAt ||
      user.passwordExpiresAt < new Date()
    ) {
      res.status(400).json({
        message: 'Invalid or expired authentication code.',
      })
    } else {
      res.status(200).json({
        message: 'Authentication code is valid.',
      })
    }
  } catch (error: unknown) {
    handleError(res, undefined, undefined, error)
  }
}

export const ResetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, code, password } = req.body

  try {
    const user = await User.findOne({
      email,
      passwordResetCode: code,
    })

    if (
      !user ||
      !user.passwordExpiresAt ||
      user.passwordExpiresAt < new Date()
    ) {
      res.status(400).json({
        message: 'Invalid or expired authentication code.',
      })
      return
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await User.findOneAndUpdate(
      { email, passwordResetCode: code },
      {
        $set: {
          password: hashedPassword,
          passwordResetCode: null,
          passwordExpiresAt: null,
        },
      }
    )

    res.status(200).json({
      message: 'Password reset successful. You can now sign in.',
    })
  } catch (error: unknown) {
    handleError(res, undefined, undefined, error)
  }
}
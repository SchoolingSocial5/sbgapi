import { Request, Response } from 'express'
import { queryData, search } from '../utils/query'
import { uploadFilesToS3 } from '../utils/fileUpload'
import { handleError } from '../utils/errorHandler'
import { Blog, IBlog } from '../models/blogModel'

export const createBlog = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const uploadedFiles = await uploadFilesToS3(req)
    uploadedFiles.forEach((file) => {
      req.body[file.fieldName] = file.s3Url
    })

    await Blog.create(req.body)
    const result = await queryData<IBlog>(Blog, req)
    res.status(200).json({
      message: 'Blog was created successfully',
      result,
    })
  } catch (error: any) {
    handleError(res, undefined, undefined, error)
  }
}

export const getABlog = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const blog = await Blog.findById(req.params.id)
    if (!blog) {
      return res.status(404).json({ message: 'blog not found' })
    }

    res.status(200).json({ data: blog })
  } catch (error) {
    console.log(error)
    handleError(res, undefined, undefined, error)
  }
}

export const updateBlog = async (req: Request, res: Response) => {
  try {
    const uploadedFiles = await uploadFilesToS3(req)
    uploadedFiles.forEach((file) => {
      req.body[file.fieldName] = file.s3Url
    })

    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!blog) {
      return res.status(404).json({ message: 'blog not found' })
    }

    res.status(200).json({
      message: 'The blog is updated successfully',
      data: blog,
    })
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const getBlogs = async (req: Request, res: Response) => {
  try {
    const result = await queryData<IBlog>(Blog, req)
    res.status(200).json(result)
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const deleteBlog = async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id)
    if (!blog) {
      return res.status(404).json({ message: 'blog not found' })
    }
    const result = await queryData<IBlog>(Blog, req)
    res.status(200).json({ message: 'Blog deleted successfully', ...result })
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const deleteBlogs = async (req: Request, res: Response) => {
  try {
    const blogs = req.body.selectedUsers
    for (const e of blogs) {
      await Blog.findByIdAndDelete(e._id)
    }
    const result = await queryData<IBlog>(Blog, req)

    return res.status(207).json({
      message: 'The blogs were deleted successfully.',
      result
    })
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const searchBlogs = (req: Request, res: Response) => {
  return search(Blog, req, res)
}

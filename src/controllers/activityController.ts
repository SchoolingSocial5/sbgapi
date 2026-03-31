import { Request, Response } from 'express'
import { io } from '../app'
import { Activity, IActivity } from '../models/activityModel'
import { handleError } from '../utils/errorHandler'
import { queryData } from '../utils/query'

interface Data {
  to: string
  form: Active
}

interface Active {
  staffName: string
  staffUsername: string
  createdAt: Date
  page: string
}

export const createActivity = async (data: Data) => {
  try {
    const form = data.form
    const activity = await Activity.create({
      staffName: form.staffName,
      staffUsername: form.staffUsername,
      page: form.page,
      createdAt: form.createdAt,
    })

    const now = new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);


    const result = await Activity.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalActivities: { $sum: 1 },
          uniqueUsers: { $addToSet: "$staffUsername" },
        },
      },
      {
        $project: {
          _id: 0,
          totalActivities: 1,
          uniqueUserCount: { $size: "$uniqueUsers" },
        },
      },
    ]);

    const counts = result[0] || {
      totalActivities: 0,
      uniqueUserCount: 0,
    };

    io.emit(`admin`, {
      activity,
      counts,
    })
  } catch (error: any) {
    console.log(error)
  }
}

export const getActivities = async (req: Request, res: Response) => {
  try {
    const result = await queryData<IActivity>(Activity, req)
    res.status(200).json(result)
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

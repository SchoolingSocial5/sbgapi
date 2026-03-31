export interface IUserData {
  ip: string
  bioUserId: string
  country: string
  countryCode: string
  online: boolean
  userId: string
  username: string
  leftAt: Date
  visitedAt: Date
}

export interface ISocketData {
  to: string
  action: string
  type: string
  postId: string
  data: IUserData
  content: string
  createdAt: Date
  media: File[]
  types: string[]
}

export const UsersSocket = async (data: ISocketData) => {
  switch (data.action) {
    case 'visit':
      console.log(data.data)
      break
    default:
      break
  }
}

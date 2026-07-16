import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const api = axios.create({ baseURL })

// Boards
export const listBoards = () => api.get('/boards')
export const createBoard = (data) => api.post('/boards', data)
export const getBoard = (id) => api.get(`/boards/${id}`)

// Lists
export const createList = (boardId, data) => api.post(`/boards/${boardId}/lists`, data)

// Cards
export const createCard = (listId, data) => api.post(`/lists/${listId}/cards`, data)
export const updateCard = (cardId, data) => api.put(`/cards/${cardId}`, data)
export const moveCard = (cardId, data) => api.patch(`/cards/${cardId}/move`, data)
export const deleteCard = (cardId) => api.delete(`/cards/${cardId}`)
export const attachTag = (cardId, tagId) => api.post(`/cards/${cardId}/tags`, { tag_id: tagId })
export const detachTag = (cardId, tagId) => api.delete(`/cards/${cardId}/tags/${tagId}`)

// Tags
export const createTag = (boardId, data) => api.post(`/boards/${boardId}/tags`, data)

// Members
export const createMember = (boardId, data) => api.post(`/boards/${boardId}/members`, data)

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { API_ROOT } from '~/utils/constants'
import { generatePlaceHolderCard } from '~/utils/formatters'
import { isEmpty } from 'lodash'
import { mapOrder } from '~/utils/sorts'

const initialState = {
  currentActiveBoard: null
}

export const fetchBoardDetailAPI = createAsyncThunk(
  'activeBoard/fetchBoardDetailAPI',
  async (boardId) => {
    const response = await axios.get(`${API_ROOT}/v1/boards/${boardId}`)
    return response.data
  }
)

export const activeBoardSlice = createSlice({
  name: 'activeBoard',
  initialState,
  reducers: {
    updateCurrentActiveBoard: (state, action) => {
      const board = action.payload
      state.currentActiveBoard = board
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchBoardDetailAPI.fulfilled, (state, action) => {
      let board = action.payload

      board.columns = mapOrder(board.columns, board?.columnOrderIds, '_id' )
      board.columns.forEach( column => {
        if (isEmpty(column.cards)) {
          column.cards = [generatePlaceHolderCard(column)]
          column.cardOrderIds = [generatePlaceHolderCard(column)._id]
        } else {
          column.cards = mapOrder( column.cards, column?.cardOrderIds, '_id' )
        }
      })

      state.currentActiveBoard = board
    })
  }
})

// Action creators are generated for each case reducer function
export const { updateCurrentActiveBoard } = activeBoardSlice.actions

export const selectCurrentActiveBoard = ( state ) => {
  return state.activeBoard.currentActiveBoard
}

//export default activeBoardSlice.reducer
export const activeBoardReducer = activeBoardSlice.reducer
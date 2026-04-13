
import Container from '@mui/material/Container'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'
//import { mockData } from '~/apis/mock-data'
import { useEffect, useState } from 'react'
import { fetchBoardDetailAPI, createNewColumnAPI, createNewCardAPI, UpdateBoardDetailAPI } from '~/apis'
import { generatePlaceHolderCard } from '~/utils/formatters'
import { isEmpty } from 'lodash'

function Board() {
  const [board, setBoard] = useState(null)

  useEffect(() => {
    const boardId = '69db6d428c4c11f2ddee5d9f'
    fetchBoardDetailAPI(boardId).then(board => {
      board.columns.forEach( column => {
        if (isEmpty(column.cards)) {
          column.cards = [generatePlaceHolderCard(column)]
          column.cardOrderIds = [generatePlaceHolderCard(column)._id]
        }
      })

      setBoard(board)
    })
  }, [])

  // Call API create new column
  const createNewColumn = async (newColumnData) => {
    const createdColumn = await createNewColumnAPI({
      ...newColumnData,
      boardId: board._id
    })

    createdColumn.cards = [generatePlaceHolderCard(createdColumn)]
    createdColumn.cardOrderIds = [generatePlaceHolderCard(createdColumn)._id]

    // updata state board
    const newBoard = { ...board }
    newBoard.columns.push(createdColumn)
    newBoard.columnOrderIds.push(createdColumn._id)

    setBoard(newBoard)

  }

  const createNewCard = async (newCardData) => {
    const createdCard = await createNewCardAPI({
      ...newCardData,
      boardId: board._id
    })

    // updata state board
    const newBoard = { ...board }
    const columnToUpdate = newBoard.columns.find(column => column._id === createdCard.columnId)
    if (columnToUpdate) {
      columnToUpdate.cards.push(createdCard)
      columnToUpdate.cardOrderIds.push(createdCard._id)
    }
    setBoard(newBoard)
  }

  const moveColumn = async (dndOrderedColumn) => {
    const dndOrderedColumnIds = dndOrderedColumn.map( c => c._id )
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumn
    newBoard.columnOrderIds = dndOrderedColumnIds
    // Call APIs update board
    await UpdateBoardDetailAPI(newBoard._id, {
      columnOrderIds: newBoard.columnOrderIds
    })

  }

  return (
    <Container disableGutters maxWidth={false} sx ={{ height: '100vh' }} >
      <AppBar />
      <BoardBar board={board} />
      <BoardContent
        board={board}
        createNewColumn={createNewColumn}
        createNewCard={createNewCard}
        moveColumn={moveColumn}
      />
    </Container>
  )
}

export default Board

import { useEffect } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'
//import { mockData } from '~/apis/mock-data'
import {
  UpdateBoardDetailAPI,
  UpdateColumnDetailAPI,
  moveCardToDifferentColumnAPI
} from '~/apis'
import CircularProgress from '@mui/material/CircularProgress'
import { Typography } from '@mui/material'
import { fetchBoardDetailAPI, updateCurrentActiveBoard, selectCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { useDispatch, useSelector } from 'react-redux'
import { cloneDeep } from 'lodash'
import { useParams } from 'react-router-dom'

function Board() {
  //const [board, setBoard] = useState(null)
  const disPatch = useDispatch()
  const board = useSelector(selectCurrentActiveBoard)

  const { boardId } = useParams()

  useEffect(() => {
    // CALL API
    disPatch(fetchBoardDetailAPI(boardId))
  }, [disPatch, boardId])


  const moveColumn = (dndOrderedColumns) => {
    const dndOrderedColumnIds = dndOrderedColumns.map( c => c._id )
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnIds

    disPatch(updateCurrentActiveBoard(newBoard))
    // Call APIs update board

    UpdateBoardDetailAPI(newBoard._id, { columnOrderIds: newBoard.columnOrderIds })
  }

  const moveCardInTheSameColumn = (dndOrderedCards, dndOrderCardIds, columnId) => {
    const newBoard = cloneDeep(board)
    const columnToUpdate = newBoard.columns.find(column => column._id === columnId)
    if (columnToUpdate) {
      columnToUpdate.cards = dndOrderedCards
      columnToUpdate.cardOrderIds = dndOrderCardIds
    }

    disPatch(updateCurrentActiveBoard(newBoard))
    // Call APIs update Card in Column
    UpdateColumnDetailAPI(columnId, { cardOrderIds: dndOrderCardIds })

  }

  const moveCardToDifferentColumns = (currentCardId, prevColumnId, nextColumnId, dndOrderedColumns) => {
    const dndOrderedColumnIds = dndOrderedColumns.map( column => column ._id )
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnIds

    let prevCardOrderIds = dndOrderedColumns.find( column => column._id === prevColumnId)?.cardOrderIds
    if (prevCardOrderIds[0].includes('placeholder-card')) prevCardOrderIds = []

    disPatch(updateCurrentActiveBoard(newBoard))
    // Call APIs

    moveCardToDifferentColumnAPI({
      currentCardId,
      prevColumnId,
      prevCardOrderIds: prevCardOrderIds,
      nextColumnId,
      nextCardOrderIds:  dndOrderedColumns.find( column => column._id === nextColumnId)?.cardOrderIds
    })
  }

  if (!board) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems:'center',
        justifyContent: 'center',
        gap: 2,
        width: '100vw',
        height: '100vh'
      }}>
        <CircularProgress />
        <Typography>
          The system is restarting, please wait a moment
        </Typography>
        <Typography>
          Loading...
        </Typography>
      </Box>
    )
  }
  return (
    <Container disableGutters maxWidth={false} sx ={{ height: '100vh' }} >
      <AppBar />
      <BoardBar board={board} />
      <BoardContent
        board={board}

        moveColumn={moveColumn}
        moveCardInTheSameColumn={moveCardInTheSameColumn}
        moveCardToDifferentColumns={moveCardToDifferentColumns}
      />
    </Container>
  )
}

export default Board

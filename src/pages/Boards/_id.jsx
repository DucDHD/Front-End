
import Container from '@mui/material/Container'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'
//import { mockData } from '~/apis/mock-data'
import { useEffect, useState } from 'react'
import { fetchBoardDetailAPI } from '~/apis'

function Board() {
  const [board, setBoard] = useState(null)

  useEffect(() => {
    const boardId = '69d6163b94607dc5b354ac18'
    fetchBoardDetailAPI(boardId).then(board => {
      setBoard(board)
    })
    // Call API
  }, [])
  return (
    <Container disableGutters maxWidth={false} sx ={{ height: '100vh' }} >
      <AppBar />
      <BoardBar board={board} />
      <BoardContent board={board} />
    </Container>
  )
}

export default Board

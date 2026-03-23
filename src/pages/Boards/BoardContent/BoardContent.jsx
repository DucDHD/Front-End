import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'
import { mapOrder } from '~/utils/sorts'
import {
  DndContext,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useEffect, useState } from 'react'

function BoardContent({ board }) {

  //const poinTerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } })
  const mouseTerSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 } })

  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 500 } })

  //const mySensors = useSensors(poinTerSensor)
  const mySensors = useSensors(mouseTerSensor, touchSensor)

  const [orderedColumnsState, setOrderedColumnsState] = useState([])
  useEffect( () => {
    const orderedColumns = mapOrder(board?.columns, board?.columnOrderIds, '_id' )
    setOrderedColumnsState(orderedColumns)
  }, [board])

  const handleDragEnd = (event) => {
    // console.log('handleDragEnd', event)
    const { active, over } = event
    if (!over) return

    if ( active.id !== over.id) {
      const oldIndex = orderedColumnsState.findIndex( c => c._id === active.id )
      const newIndex = orderedColumnsState.findIndex( c => c._id === over.id )

      const dndOrderedColumn = arrayMove(orderedColumnsState, oldIndex, newIndex)
      // const dndOrderedColumnIds = dndOrderedColumn.map( c => c._id )
      // console.log('🚀 ~ handleDragEnd ~ dndOrderedColumn:', dndOrderedColumn)
      // console.log('🚀 ~ handleDragEnd ~ dndOrderedColumnIds:', dndOrderedColumnIds)
      setOrderedColumnsState(dndOrderedColumn)
    }
  }
  return (
    <DndContext onDragEnd={handleDragEnd} sensors={mySensors}>
      <Box sx={{
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2'),
        width: '100%',
        height: (theme) => theme.trello.boardContentHeight,
        p: '10px 0'
      }}>
        <ListColumns columns={orderedColumnsState} />
      </Box>
    </DndContext>
  )
}

export default BoardContent

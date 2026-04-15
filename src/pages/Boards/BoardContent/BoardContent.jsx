import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'
import {
  DndContext,
  //PointerSensor,
  // MouseSensor,
  // TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  closestCorners,
  //closestCenter,
  pointerWithin,
  //rectIntersection,
  getFirstCollision

} from '@dnd-kit/core'
import { MouseSensor, TouchSensor } from '~/customLibraries/DndKitSensors'

import { arrayMove } from '@dnd-kit/sortable'
import { useEffect, useState, useCallback, useRef } from 'react'
import Column from './ListColumns/Column/Column'
import Card from './ListColumns/Column/ListCard/Card'
import { cloneDeep, isEmpty } from 'lodash'
import { generatePlaceHolderCard } from '~/utils/formatters'


const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD'
}

function BoardContent({ board, createNewColumn, createNewCard, moveColumn, moveCardInTheSameColumn, moveCardToDifferentColumns }) {

  //const poinTerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } })
  const mouseTerSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 } })
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 500 } })
  //const mySensors = useSensors(poinTerSensor)
  const mySensors = useSensors(mouseTerSensor, touchSensor)

  const [orderedColumnsState, setOrderedColumnsState] = useState([])

  const [activeDragItemId, setActiveDragItemId] = useState(null)
  const [activeDragItemType, setActiveDragItemType] = useState(null)
  const [activeDragItemData, setActiveDragItemData] = useState(null)
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] = useState(null)

  const lastOverId = useRef(null)

  useEffect( () => {
    const orderedColumns = board.columns
    setOrderedColumnsState(orderedColumns)
  }, [board])

  const findColumnByCardId = (cardId) => {
    return orderedColumnsState.find(column => column?.cards?.map(card => card._id)?.includes(cardId))
  }
  const moveCardBetweenDifferentColumns = (
    overColumn,
    active,
    over,
    overCardId,
    activeColumn,
    activeDraggingCardId,
    activeDraggingCardData,
    triggerFrom
  ) => {
    setOrderedColumnsState(prevColumn => {
      const overCardIndex = overColumn?.cards?.findIndex(card => card._id === overCardId)

      let newCardIndex
      const isBelowOverItem = active.rect.current.translated &&
      active.rect.current.translated.top > over.rect.top + over.rect.height
      const modifier = isBelowOverItem ? 1 : 0
      newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn?.cards?.length + 1

      // Clone mảng prevColumn bằng cloneDeep tương tự [...prevColumn]
      const nexColumns = cloneDeep(prevColumn)
      const nextActiveColumn = nexColumns.find(column => column._id === activeColumn._id)
      const nextOverColumn = nexColumns.find( column => column._id === overColumn._id )

      if (nextActiveColumn) {
        nextActiveColumn.cards = nextActiveColumn.cards.filter(card => card._id !== activeDraggingCardId)
        if (isEmpty(nextActiveColumn.cards)) {
          nextActiveColumn.cards = [generatePlaceHolderCard(nextActiveColumn)]
        }
        // cập nhập
        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(card => card._id)
      }
      if (nextOverColumn) {
        nextOverColumn.cards = nextOverColumn.cards.filter(card => card._id !== activeDraggingCardId)
        const rebuild_activeDraggingCardData = {
          ...activeDraggingCardData,
          columnId: nextOverColumn._id
        }
        nextOverColumn.cards = nextOverColumn.cards.filter(card => !card.FE_placeholderCard)
        nextOverColumn.cards = nextOverColumn.cards.toSpliced(newCardIndex, 0, rebuild_activeDraggingCardData)
        // cập nhập
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map(card => card._id)
      }

      if (triggerFrom === 'handleDragEnd') {
        moveCardToDifferentColumns(activeDraggingCardId, oldColumnWhenDraggingCard._id, nextOverColumn._id, nexColumns)
      }
      return nexColumns
    })

  }

  const handleDragStart = (event) => {
    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(event?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN)
    setActiveDragItemData(event?.active?.data?.current)

    if (event?.active?.data?.current?.columnId) {
      setOldColumnWhenDraggingCard(findColumnByCardId(event?.active?.id))
    }
  }

  const handleDragOver = (event) => {
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return

    const { active, over } = event
    if (!active || !over) return

    const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
    const { id: overCardId } = over
    const activeColumn = findColumnByCardId(activeDraggingCardId)
    const overColumn = findColumnByCardId(overCardId)


    if (!activeColumn || !overColumn) return

    if (activeColumn._id !== overColumn._id) {

      moveCardBetweenDifferentColumns(
        overColumn,
        active,
        over,
        overCardId,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData,
        'handleDragOver'
      )
    }
  }

  const handleDragEnd = (event) => {
    //console.log('handleDragEnd', event
    const { active, over } = event
    if (!active || !over) return

    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
      const { id: overCardId } = over
      const activeColumn = findColumnByCardId(activeDraggingCardId)
      const overColumn = findColumnByCardId(overCardId)

      if (!activeColumn || !overColumn) return

      if (oldColumnWhenDraggingCard._id !== overColumn._id) {
        moveCardBetweenDifferentColumns(
          overColumn,
          active,
          over,
          overCardId,
          activeColumn,
          activeDraggingCardId,
          activeDraggingCardData,
          'handleDragEnd'
        )
      } else {
        const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex( card => card._id === activeDragItemId)
        const newCardIndex = overColumn?.cards?.findIndex( card => card._id === overCardId)
        const dndOrderedCards = arrayMove(oldColumnWhenDraggingCard?.cards, oldCardIndex, newCardIndex)
        const dndOrderCardIds = dndOrderedCards.map( card => card._id )

        setOrderedColumnsState( prevColumn => {
          const nexColumns = cloneDeep(prevColumn)
          const targetColumn = nexColumns.find( column => column._id === overColumn._id )
          targetColumn.cards = dndOrderedCards
          targetColumn.cardOrderIds = dndOrderCardIds
          return nexColumns
        })
        // Call APIs
        moveCardInTheSameColumn(dndOrderedCards, dndOrderCardIds, oldColumnWhenDraggingCard._id)
      }
    }

    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      if (!active || !over) return
      if ( active.id !== over.id) {
        const oldColumnIndex = orderedColumnsState.findIndex( c => c._id === active.id )
        const newColumnIndex = orderedColumnsState.findIndex( c => c._id === over.id )

        const dndOrderedColumn = arrayMove(orderedColumnsState, oldColumnIndex, newColumnIndex)
        setOrderedColumnsState(dndOrderedColumn)
        moveColumn(dndOrderedColumn)
      }
    }

    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
    setOldColumnWhenDraggingCard(null)

  }

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5'
        }
      }
    })
  }

  const collisionDetectionStrategy = useCallback((args) => {

    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      return closestCorners({ ...args })
    }
    const pointerInterSection = pointerWithin(args)
    if (!pointerInterSection?.length) return

    // const intersections = !!pointerInterSection?.length
    //   ? pointerInterSection
    //   : rectIntersection(args)

    let overId = getFirstCollision(pointerInterSection, 'id')
    if (overId) {
      const checkColumn = orderedColumnsState.find(column => column._id === overId)
      if (checkColumn) {
        overId = closestCorners({
          ...args,
          droppableContainers: args.droppableContainers.filter(container => {
            return (container.id !== overId) && (checkColumn?.cardOrderIds?.includes(container.id))
          })
        })[0]?.id
      }
      lastOverId.current = overId
      return [{ id: overId }]
    }
    return lastOverId.current ? [{ id: lastOverId.current }] : []
  }, [activeDragItemType, orderedColumnsState])

  return (
    <DndContext
      sensors={mySensors}
      //collisionDetection={closestCorners}
      collisionDetection={collisionDetectionStrategy}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragStart={handleDragStart}
    >
      <Box sx={{
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2'),
        width: '100%',
        height: (theme) => theme.trello.boardContentHeight,
        p: '10px 0'
      }}>
        <ListColumns
          columns={orderedColumnsState}
          createNewColumn={createNewColumn}
          createNewCard={createNewCard}
        />
        <DragOverlay dropAnimation={dropAnimation}>
          {(!activeDragItemType) && null}
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) && <Column column={activeDragItemData} /> }
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) && <Card card={activeDragItemData} /> }
        </DragOverlay>
      </Box>
    </DndContext>
  )
}

export default BoardContent

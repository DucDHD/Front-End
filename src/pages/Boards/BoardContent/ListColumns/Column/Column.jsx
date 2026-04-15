import AddCardIcon from '@mui/icons-material/AddCard'
import Cloud from '@mui/icons-material/Cloud'
import ContentCopy from '@mui/icons-material/ContentCopy'
import ContentCut from '@mui/icons-material/ContentCut'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import DragHandleIcon from '@mui/icons-material/DragHandle'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import ListCard from './ListCard/ListCard'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TextField from '@mui/material/TextField'
import CloseIcon from '@mui/icons-material/Close'
import { toast } from 'react-toastify'

function Column( { column, createNewCard } ) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column._id,
    data: { ...column }
  })

  const dndKitColumnStyle = {
    //touchAction: 'none',
    transform: CSS.Translate.toString(transform),
    transition,
    height: '100%',
    opacity: isDragging ? 0.5 : undefined
  }

  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  const cardOrderedCards = column.cards

  const [openNewCardFrom, setOpenNewcardFrom] = useState(false)
  const toggleOpenNewcardFrom = () => setOpenNewcardFrom(!openNewCardFrom)
  const [newCardTitle, setNewCardTitle] = useState('')

  const addNewCard = () => {
    if (!newCardTitle) {
      toast.error('please enter card!', {
        position: 'bottom-right'
      })
      return
    }
    const newCardData = {
      title: newCardTitle,
      columnId: column._id
    }

    createNewCard(newCardData)

    //console.log(newCardTitle)
    toggleOpenNewcardFrom()
    setNewCardTitle('')
  }

  return (
    <div
      ref={setNodeRef}
      style={dndKitColumnStyle}
      {...attributes}
    >
      <Box
        {...listeners}
        sx={{
          minWidth: '300px',
          maxWidth: '300px',
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#333643' : '#ebecf0'),
          ml: '16px',
          borderRadius: '6px',
          height: 'fit-content',
          maxHeight: (theme) => `calc( ${theme.trello.boardContentHeight} - ${theme.spacing(5)})`
        }}
      >
        {/* {Box Column Header } */}
        <Box sx={{
          height: (theme) => theme.trello.columnHeaderHeight,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h6" sx={{
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer'
          }} >
            {column?.title}
          </Typography>
          <Box>
            <Tooltip title="More options">
              <ExpandMoreIcon
                sx={{ color: 'text.primary', cursor: 'pointer' }}
                id="basic-column-dropdown"
                aria-controls={open ? 'basic-menu-column-dropdown' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
              />
            </Tooltip>
            <Menu
              id="basic-menu-column-dropdown"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'basic-column-dropdown'
              }}
            >
              <MenuItem onClick={handleClose}>
                <ListItemIcon><AddCardIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Add New Card</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleClose}>
                <ListItemIcon><ContentCut fontSize="small" /></ListItemIcon>
                <ListItemText>Cut</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleClose}>
                <ListItemIcon><ContentCopy fontSize="small" /></ListItemIcon>
                <ListItemText>Copy</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleClose}>
                <ListItemIcon><Cloud fontSize="small" /></ListItemIcon>
                <ListItemText>Archive this Column</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleClose}>
                <ListItemIcon><DeleteForeverIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Remove this Column</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        {/* List Card */}
        <ListCard cards={cardOrderedCards} />
        {/* {Box Footer } */}
        <Box sx={{
          height: (theme) => theme.trello.columnFooterHeight,
          p: 2
        }}>
          {!openNewCardFrom
            ? <Box sx ={{
              height:'100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent:'space-between'
            }} >
              <Button startIcon={<AddCardIcon/>} onClick={toggleOpenNewcardFrom} >Add New Card </Button>
              <Tooltip title = "Drag to move">
                <DragHandleIcon sx={{ cursor: 'pointer' }} />
              </Tooltip>
            </Box>
            : <Box sx={{
              height:'100%',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
            >
              <TextField
                label="Enter Card title..."
                type="text"
                size="small"
                variant='outlined'
                autoFocus
                data-no-dnd="True"
                value={newCardTitle}
                onChange={ (e) => setNewCardTitle(e.target.value) }
                sx={{
                  '& label': { color: 'text.primary' },
                  '& input': {
                    color: (theme) => theme.palette.primary.main,
                    bdcolor: (theme) => (theme.palette.mode === 'dark' ? '#333643' : 'white')
                  },
                  '& label.Mui-focused': { color: (theme) => theme.palette.primary.main },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor:  (theme) => theme.palette.primary.main },
                    '&:hover fieldset': { borderColor:  (theme) => theme.palette.primary.main },
                    '&:Mui-focused fieldset': { borderColor:  (theme) => theme.palette.primary.main }
                  },
                  '& .MuiOutlinedInput-input' : { borderRadius: 1 }
                }}
              />
              <Box sx={{ display: 'flex', alignItems:'center', gap:1 }} >
                <Button
                  className="interceptor-loading"
                  data-no-dnd="True"
                  onClick={addNewCard}
                  variant='contained'color='success' size='small'
                  sx={{
                    boxShadow:'none',
                    border:'0.5px solid',
                    borderColor: (theme) => theme.palette.success.main,
                    '&:hover': { bgcolor: (theme) => theme.palette.success.light }
                  }}
                >Add </Button>
                <CloseIcon
                  fontSize='small'
                  sx={{
                    color: (theme) => theme.palette.warning.light,
                    cursor: 'pointer',
                    '&:hover': { color: (theme) => theme.palette.warning.light }
                  }}
                  onClick= {toggleOpenNewcardFrom}
                />
              </Box>
            </Box>
          }

        </Box>
      </Box>
    </div>
  )
}

export default Column

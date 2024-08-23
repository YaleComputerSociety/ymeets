import ReactDOM from 'react-dom/client'
import './index.css'
import Root from './Root'
import { Favi } from './components/NavBar/CalendarIcon'

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
  <>
    <Favi></Favi>

    <Root />
  </>
)

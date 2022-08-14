import React from 'react'
import styled from 'styled-components'
import MenuItem from './MenuItem'

const TabPanel = ({ step, menu, selectMenu, setSelectMenu }) => {
  return (
    <ItemWrapper>
      {menu?.map((item, index) => (
        <MenuItem
          key={item.menuId}
          item={item}
          selectMenu={selectMenu}
          setSelectMenu={setSelectMenu}
          popular={item.salesCnt > 0 && index === 0}
          step={step}
        />
      ))}
    </ItemWrapper>
  )
}

const ItemWrapper = styled.section`
  display: grid;
  grid-template: repeat(3, 1fr) / repeat(3, 1fr);
  grid-gap: 1rem;
  flex-basis: 450px;
  flex-grow: 1;
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f8f8f8;
  border-radius: 10px;
  border: 4px solid #353535;
  overflow: scroll;
  box-shadow: inset -4px -4px 0px 0px #adafbc;
`

export default TabPanel

import React from 'react'
import styled from 'styled-components'

function Tab({ id, value, onClickTab, active }) {
  return (
    <Item onClick={() => onClickTab(id)}>
      <ItemText active={active}>{value}</ItemText>
    </Item>
  )
}

const Item = styled.li`
  flex: 0 0 10rem;
  list-style: none;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  font-size: 1.5rem;
  border-bottom: 2px solid transparent;
  cursor: grab;
`
const ItemText = styled.a`
  cursor: pointer;
  user-select: none;
  -moz-user-select: none;
  -webkit-user-drag: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  ${(props) => !props.active} {
    color: #e6584c;
  }
  &:hover {
    color: #e6584c;
  }
`

export default Tab

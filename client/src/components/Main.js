import React, { useRef, useState } from 'react'
import styled from 'styled-components'
import Tab from './Tab'
import API from '../util/api'
import TabPanel from './TabPanel'
import Container from './Container'
import Badge from './Badge'
import Button from './Button'
import Counter from './Counter'
import Payment from './Payment'
import LoadingIndicator from './LoadingIndicator'
import Receipt from './Receipt'
import Input from './Input'

const ItemsLayout = styled.section`
  display: flex;
  grid-area: items;
  flex-direction: column;
  justify-content: center;
`
const CashLayout = styled.section`
  display: flex;
  flex-direction: column;
  grid-area: cash;
  justify-content: space-around;
  padding-top: 1rem;
`
const CartLayout = styled.section`
  display: flex;
  grid-area: cart;
  background-color: #484848;
  border-radius: 10px;
  border: 4px solid #353535;
  overflow: scroll;
  padding: 1rem;
  box-shadow: inset -4px -4px 0px 0px #353535;
`

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`
const SelectItemWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
  flex: 0 0 150px;
  margin: 0 0.5rem;
  background-color: #fff;
  border-radius: 10px;
  border: 4px solid #353535;

  @keyframes drop {
    0% {
      transform: translateY(-30px) scaleY(0.9);
      opacity: 0;
    }
    5% {
      opacity: 0.7;
    }
    50% {
      transform: translateY(0px) scaleY(1);
      opacity: 1;
    }
    65% {
      transform: translateY(-17px) scaleY(0.9);
      opacity: 1;
    }
    75% {
      transform: translateY(-22px) scaleY(0.9);
      opacity: 1;
    }
    100% {
      transform: translateY(0px) scaleY(1);
      opacity: 1;
    }
  }

  opacity: 0;
  animation: drop 0.4s linear forwards 0.4s;
`
const ItemImage = styled.img`
  object-fit: scale-down;
  width: 100%;
  height: 100%;
`
const OptionWrapper = styled.span`
  text-align: center;
  margin: 0.25rem;
  font-size: 1.25rem;
`
const PaymentLayout = styled.section`
  display: flex;
  flex-direction: column;
  grid-area: payment;
  justify-content: space-between;
`
const TimerWrapper = styled.div`
  display: flex;
  flex-direction: column;
`
const TimerLabel = styled.label`
  color: #fff;
  font-size: 1.25rem;
  margin-bottom: 1rem;
`
const TabsWrapper = styled.section`
  position: relative;
  width: 100%;
  height: 5rem;
  display: flex;
  overflow: auto;
  background-color: #f8f8f8;
  border-radius: 10px;
  border: 4px solid #353535;
  user-select: none;
  -moz-user-select: none;
  -webkit-user-drag: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  box-shadow: inset -4px -4px 0px 0px #adafbc;
`
const TabsContainer = styled.ul`
  display: flex;
  width: 100%;
  white-space: nowrap;
  overflow: auto;
  -ms-overflow-style: -ms-autohiding-scrollbar;
  -webkit-overflow-scrolling: touch;
  user-select: none;
  -moz-user-select: none;
  -webkit-user-drag: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  &::-webkit-scrollbar {
    display: none;
  }
`

function Main() {
  const wrapperRef = React.useRef()
  const containerRef = React.useRef()
  let startX = useRef(0)
  let scrollLeft = useRef(0)
  let wait = useRef(false)
  let fps = useRef(50)
  let down = useRef(null)
  let up = useRef(null)

  const [menu, setMenu] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tabIndex, setTabIndex] = useState(0)
  const [selectMenu, setSelectMenu] = useState([])
  const [errorMessage, setErrorMessge] = useState('')
  const [step, setStep] = useState('main')
  const [payment, setPayment] = useState({})

  const paymentId = payment.id
  const paymentTitle = payment.title
  const orderNum = payment.orderNum
  const paymentAmount = selectMenu.reduce((acc, curr) => acc + curr.price, 0)
  const totalAmount = selectMenu.reduce((acc, curr) => acc + curr.price, 0)

  const handleLoading = () => {
    setLoading((prevLoading) => !prevLoading)
  }

  const handleClickPayment = () => {
    setStep('payment')
  }

  const handleClearMenu = () => {
    setSelectMenu([])
  }

  const handleRemoveMenu = (menuId, optionId) => {
    const filterMenu = selectMenu.filter((menu) => {
      return !(menu.menuId === menuId && menu.optionId === optionId)
    })
    setSelectMenu(filterMenu)
  }

  const handleSelectMenu = (menu) => {
    const addedMenu = [...selectMenu, menu]
    const newArrayOfMenu = addedMenu.reduce((acc, obj) => {
      let objectFound = acc.find(
        (arrItem) =>
          arrItem.menuId === obj.menuId && arrItem.optionId === obj.optionId
      )
      if (objectFound) {
        objectFound.quantity = objectFound.quantity + obj.quantity
      } else {
        acc.push(obj)
      }

      return acc
    }, [])

    setSelectMenu(newArrayOfMenu)
  }

  const handleSubmitOrder = async ({ id, title }) => {
    if (id === 1) {
      setStep('cash')
    } else {
      const orderNum = await API.post('/api/orders', {
        paymentId: id,
        paymentAmount,
        totalAmount,
        menu: [...selectMenu],
      })

      setPayment({
        id,
        title,
        orderNum,
      })

      setStep('reciept')

      const data = await fetchMenu()
      setMenu(data)
    }
  }
  const fetchMenu = () => {
    return API.get(`/api/menu`)
  }

  React.useEffect(() => {
    document.addEventListener('mousemove', (e) => {
      if (!startX.current || wait.current) return
      wait.current = true //throttle
      setTimeout(() => (wait.current = false), 1000 / fps.current)
      const offset = e.pageX
      containerRef.current.scrollLeft =
        scrollLeft.current + startX.current - offset
    })

    document.addEventListener('mouseup', (e) => {
      startX.current = 0
      up.current = e.clientX
      containerRef.current.style.cursor = 'grab'
    })

    const getData = async () => {
      try {
        const data = await fetchMenu()
        setMenu(data)
      } catch (err) {
        setMenu(null)
        setErrorMessge(err.message)
      } finally {
        setLoading(false)
      }
    }
    getData()
  }, [])

  const handleMouseDown = (e) => {
    startX.current = e.pageX
    scrollLeft.current = containerRef.current.scrollLeft

    up.current = null
    down.current = e.clientX

    e.target.style.cursor = 'grabbing'
  }

  const handleClick = (id) => {
    if (down.current !== up.current) {
      return
    }
    setTabIndex(id - 1)
  }

  return (
    <>
      {loading && (
        <LoadingIndicator
          title={step === 'payment' ? '카드 결제 중' : '잠시 기다려 주세요'}
        ></LoadingIndicator>
      )}
      {menu ? (
        <>
          <ItemsLayout>
            <TabsWrapper ref={wrapperRef}>
              <TabsContainer ref={containerRef} onMouseDown={handleMouseDown}>
                {menu.map(({ id, title }) => {
                  return (
                    <Tab
                      key={id}
                      id={id}
                      value={title}
                      clickTab={handleClick}
                      active={id === tabIndex + 1}
                    />
                  )
                })}
              </TabsContainer>
            </TabsWrapper>
            <TabPanel
              menu={menu[tabIndex]?.menu}
              onSelectMenu={handleSelectMenu}
            />
          </ItemsLayout>
          <CashLayout>
            <Input
              title="주문금액"
              value={totalAmount.toLocaleString()}
              color="white"
            ></Input>
            <Input title="투입금액" value={0} color="white"></Input>
            <Button size="lg" variant="normal" disabled={step !== 'cash'}>
              500원
            </Button>
            <Button size="lg" variant="normal" disabled={step !== 'cash'}>
              100원
            </Button>
            <Button size="lg" variant="normal" disabled={step !== 'cash'}>
              1,000원
            </Button>
            <Button size="lg" variant="normal" disabled={step !== 'cash'}>
              10,000원
            </Button>
            <Button size="lg" variant="warning" disabled={step !== 'cash'}>
              현금 결제하기
            </Button>
          </CashLayout>
          <CartLayout>
            {selectMenu.length > 0 &&
              selectMenu.map((item) => {
                return (
                  <SelectItemWrapper key={item.menuId}>
                    <ButtonWrapper>
                      <button
                        onClick={() =>
                          handleRemoveMenu(item.menuId, item.optionId)
                        }
                      >
                        X
                      </button>
                    </ButtonWrapper>
                    <Container title={item.title}>
                      <ItemImage
                        src={`images/${item.categoryId}.png`}
                        alt="product item"
                      ></ItemImage>
                      <Badge variant="normal" icon={false}>
                        {item.price.toLocaleString()}
                      </Badge>
                    </Container>
                    <OptionWrapper>
                      <p>{item.optionTitle.split(',').join('/')}</p>
                      <p>수량: {item.quantity}개</p>
                    </OptionWrapper>
                  </SelectItemWrapper>
                )
              })}
          </CartLayout>
          <PaymentLayout>
            {selectMenu.length > 0 && step === 'main' && (
              <>
                <TimerWrapper>
                  <TimerLabel>남은 시간</TimerLabel>
                  <Counter
                    onHandleCount={handleClearMenu}
                    stop={step !== 'main'}
                  ></Counter>
                </TimerWrapper>
                <Button size="lg" variant="normal" onClick={handleClearMenu}>
                  전체 취소
                </Button>
                <Button
                  size="lg"
                  variant="success"
                  onClick={handleClickPayment}
                >
                  결제하기
                </Button>
              </>
            )}
          </PaymentLayout>
          {step === 'payment' && (
            <Payment
              onHandleLoading={handleLoading}
              onHandleSubmit={handleSubmitOrder}
              setStep={setStep}
            ></Payment>
          )}
          {step === 'reciept' && (
            <Receipt
              orderNum={orderNum}
              orderMenu={selectMenu}
              paymentId={paymentId}
              paymentTitle={paymentTitle}
              paymentAmount={paymentAmount}
              totalAmount={totalAmount}
              setStep={setStep}
            ></Receipt>
          )}
        </>
      ) : (
        <div>{errorMessage}</div>
      )}
    </>
  )
}

export default Main
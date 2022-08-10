import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import API from '../../../util/api'
import Tabs from '../../layout/Tabs'
import PaymentModal from '../../layout/PaymentModal'
import LoadingIndicator from '../../common/LoadingIndicator'
import Receipt from '../../layout/Receipt'
import CartLayout from '../../layout/CartLayout'
import CashLayout from '../../layout/CashLayout'
import OrderLayout from '../../layout/OrderLayout'

const ItemsLayout = styled.section`
  display: flex;
  grid-area: items;
  flex-direction: column;
  justify-content: center;
`

const BASE_URL = process.env.REACT_APP_API_HOST

function Main() {
  const [menu, setMenu] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectMenu, setSelectMenu] = useState([])
  const [errorMessage, setErrorMessge] = useState('')
  const [step, setStep] = useState('main')
  const [payment, setPayment] = useState({})
  const [paymentAmount, setPaymentAmount] = useState(0)

  const paymentId = payment.id
  const paymentTitle = payment.title
  const orderNum = payment.orderNum
  const totalAmount = selectMenu.reduce((acc, curr) => acc + curr.price, 0)

  const fetchMenu = () => {
    return API.get(`${BASE_URL}/api/menu`)
  }

  useEffect(() => {
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

  const orderMenu = async ({ id, title }) => {
    const orderNum = await API.post(`${BASE_URL}/api/orders`, {
      paymentId: id,
      paymentAmount: id === 1 ? paymentAmount : totalAmount,
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

  const handleSubmitOrder = async ({ id, title }) => {
    if (id === 1) {
      setStep('cash')
    } else {
      orderMenu({ id, title })
    }
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
            <Tabs menu={menu} onSelectMenu={handleSelectMenu}></Tabs>
          </ItemsLayout>
          <CashLayout
            totalAmount={totalAmount}
            paymentAmount={paymentAmount}
            step={step}
            setPaymentAmount={setPaymentAmount}
            orderMenu={orderMenu}
          ></CashLayout>
          <CartLayout
            selectMenu={selectMenu}
            step={step}
            onClickRemoveMenu={handleRemoveMenu}
          ></CartLayout>
          <OrderLayout
            selectMenu={selectMenu}
            step={step}
            setStep={setStep}
            setSelectMenu={setSelectMenu}
          ></OrderLayout>
          {step === 'payment' && (
            <PaymentModal
              onSubmit={handleSubmitOrder}
              setLoading={setLoading}
              setStep={setStep}
              setSelectMenu={setSelectMenu}
            ></PaymentModal>
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
              setSelectMenu={setSelectMenu}
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

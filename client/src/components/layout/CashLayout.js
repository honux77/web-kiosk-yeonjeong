import React, { useState } from 'react'
import styled from 'styled-components'
import API from '../../util/api'
import AlertModal from '../common/AlertModal'
import Button from '../common/Button'
import Input from '../common/Input'

const CashLayoutStyle = styled.section`
  display: flex;
  flex-direction: column;
  grid-area: cash;
  justify-content: space-around;
  padding-top: 1rem;
`

const BASE_URL = process.env.REACT_APP_API_HOST

const CashLayout = ({
  step,
  setStep,
  selectMenu,
  setPayment,
  paymentAmount,
  setPaymentAmount,
}) => {
  const [error, setError] = useState(false)
  const totalAmount = selectMenu.reduce((acc, curr) => acc + curr.price, 0)
  const orderMenu = async () => {
    try {
      const orderNum = await API.post(`${BASE_URL}/api/orders`, {
        paymentId: 1,
        paymentAmount,
        totalAmount,
        menu: [...selectMenu],
      })

      setPayment((prevPayment) => {
        return {
          ...prevPayment,
          orderNum,
        }
      })
      setStep('receipt')
    } catch (err) {
      setError(true)
    }
  }

  const amountList = [100, 500, 1000, 10000]
  return (
    <>
      {error && (
        <AlertModal
          message="결제 중 오류가 발생했습니다."
          onClose={() => setError(false)}
        ></AlertModal>
      )}
      <CashLayoutStyle>
        <Input
          title="주문금액"
          value={totalAmount.toLocaleString()}
          color="white"
        ></Input>
        <Input
          title="투입금액"
          value={paymentAmount.toLocaleString()}
          color="white"
        ></Input>
        {amountList.map((amount) => {
          return (
            <Button
              key={amount}
              size="lg"
              variant="normal"
              data-amount={amount}
              disabled={step !== 'cash'}
              onClick={() =>
                setPaymentAmount(
                  (prevPaymentAmout) => prevPaymentAmout + amount
                )
              }
            >
              {amount.toLocaleString() + '원'}
            </Button>
          )
        })}
        <Button
          size="lg"
          variant="warning"
          disabled={step !== 'cash' || totalAmount > paymentAmount}
          onClick={() => orderMenu()}
        >
          현금 결제하기
        </Button>
      </CashLayoutStyle>
    </>
  )
}

export default CashLayout

"use client"

/**Dependencies */
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"

/**Actions */

/**Components */
import ContainerCustom from "@/components/Container"
import { CustomTextInput } from "@/components/CustomInputs"
import PageHeader from "@/components/PageHeader"
import { Box, Button, SelectChangeEvent, Stack } from "@mui/material"

/**Icons */
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import { toast } from "react-toastify"
import { ConfirmPopup } from "@/components/Popups"
import DGrid from "@/components/DGrid"
import ExpenseService from "@/actions/expenses"
import moment from "moment"

interface IProps {
    params: {
        slug: Array<string>
    }
}

interface IErroForm {
    name: boolean,
    value: boolean,
    repeat: boolean
}

const ExpenseRegisterOrUpdate = ({ params }: IProps) => {
    const router = useRouter()
    const { slug } = params;
    const [action, setAction] = useState<string>()
    const initialExpense: IExpense = {
        name: "",
        value: 0,
        repeat: 0,
        portions: [],
        datePortion: ''
    }
    const [errorInput, setErrorInput] = useState<null | IErroForm>(null)

    const [expense, setExpense] = useState<IExpense>(initialExpense)
    const [popupConfirmToggle, setPopupConfirmToggle] = useState<boolean>(false)
    const handleClose = () => {
        setPopupConfirmToggle(false)
    }

    const changeValues = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string> | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const name = e.target.name
        let value: any = e.target.value

        if (name == 'repeat') {
            value = parseInt(value)
        }

        setExpense({ ...expense, [name]: value })
    }

    const getExpenseById = async (id: number) => {
        try {
        } catch (error) {
            toast.error("Algo deu errado ao exibir o Despesa")
        }
    }

    const saveExpense = async () => {
        setErrorInput(null)

        let error: any = {}
        const expenseAny: any = expense
        Object.keys(expense).map(key => {
            if (
                key !== 'id' &&
                key !== 'repeat' &&
                (expenseAny[key] === '' || expenseAny[key] === 0 || expenseAny[key] === undefined)) {
                error = {
                    ...error, [key]: true
                }
            }
        })

        if (Object.keys(error).length !== 0) {
            return setErrorInput(error)
        }

        const portions: IPortionsList[] = Array.from(new Array(expense.repeat - 1)).map((value, index) => ({
            datePortion: moment(moment().add(index + 1, 'M'), '', true).format()
        }))


        try {
            slug[0] == "register" ? await ExpenseService.saveExpense({ ...expense, portions }) : null
            // slug[0] == "edit" ? await ProductServices.editProduct(!expense.type ? { ...expense, type: 'edição' } : expense) : null
            // setExpense(initialExpense)
            handleClose
            toast.success("Despesa Salvo com sucesso!")
            // goBack
        } catch (error) {
            toast.error("Algo deu errado ao salvar o Despesa")
        }
    }

    const goBack = () => {
        router.replace("/expenses")
    }

    useEffect(() => {
        if (slug[0] == "edit") {
            setAction("Editar")
            getExpenseById(parseInt(slug[1]))
        } else {
            setAction("Cadastrar")
        }
    }, [slug])

    return (
        <React.Fragment>
            <PageHeader title={`${action} Despesa`} />
            <ContainerCustom title="Dados da Despesa">
                <DGrid>
                    <CustomTextInput fullWidth value={expense?.name} label={"Nome"} name={"name"} required={true} changeFunction={changeValues} error={errorInput?.name} />
                    <CustomTextInput fullWidth value={expense?.value} label={"Valor"} name={"value"} required={true} changeFunction={changeValues} error={errorInput?.value} />
                    <CustomTextInput fullWidth value={expense?.repeat} label={"Esta Despesa Se Repete Por Quantos Meses?"} name={"repeat"} required={true} changeFunction={changeValues} error={errorInput?.repeat} type="number" />
                </DGrid>
                <Box sx={{ display: 'flex', placeContent: 'flex-end' }}>
                    <Stack direction="row" spacing={2}>
                        <Button color="error" onClick={goBack} variant="outlined" endIcon={<CloseIcon />}>Cancelar</Button>
                        <Button color="success" onClick={() => setPopupConfirmToggle(true)} variant="contained" endIcon={<SaveIcon />}>Salvar</Button>
                    </Stack>
                </Box>
            </ContainerCustom>
            <ConfirmPopup
                toggle={popupConfirmToggle}
                title={`${action} Despesa`}
                message={"Confirma esta ação?"}
                confirmAction={saveExpense}
                cancelFunction={handleClose}
            />
        </React.Fragment>
    )
}

export default ExpenseRegisterOrUpdate
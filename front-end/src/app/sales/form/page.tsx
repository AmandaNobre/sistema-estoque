//ESTÁ COM ERRO QUE AO EDITAR OU EXCLUIR PRODUTO O VALOR DA VENDA, VALOR PAGO, TROCO E PARCELAS NÃO SOFREM ALTERAÇÃO
'use client'

/**Dependencies */
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from 'react'

/**Components */
import PageHeader from "@/components/PageHeader"
import TableCustom from "@/components/TableCustom";
import { ConfirmPopup, CustomPopup } from "@/components/Popups";
import ContainerCustom from "@/components/Container";
import { ButtonPlus } from "@/components/ButtonPlus";
import { CustomTextInput } from "@/components/CustomInputs";
import { Box, Button, Stack, TextField, SelectChangeEvent, FormControl, FormHelperText, Autocomplete, InputLabel, Select, MenuItem, Typography } from "@mui/material"

/**Icons */
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';

/**Service */
import Client from "@/actions/client";
import SalesService from "@/actions/sales";
import ProductServices from "@/actions/productServices";


interface IErroForm {
    clientId?: boolean,
    produtoId?: boolean,
    quantidade?: boolean
    discount?: boolean,
    amountPaid?: boolean,
    paymentForm?: boolean
}

const SalesForm = () => {

    const titles: Array<ITitles> = [
        { label: "Produto", value: 'productName' },
        { label: "Quantidade", value: 'qtdChange' },
        { label: "Preço Unitário", value: 'currentPrice', valuePrefix: "currency" },
        { label: "Total", value: 'totalCurrentPrice', valuePrefix: "currency" }
    ]

    const paymentForms: Array<PaymentForm> = ["Cartão de Crédito a Vista", "Cartão de Crédito Parcelado", "Cartão de Débito", "PIX", "Dinheiro"]

    const initialSale: ISale = {
        id: 0,
        products: [],
        qtd: '',
        clientId: '',
        value: 0,
        clientName: "",
        discount: 0,
        dateCreated: new Date(),
        valueBeforeDIscount: 0,
        valueCostPrice: 0,
        productsString: '',
        paymentForm: "",
        amountPaid: 0,
        customerChangeCash: 0,
        paymentInstallments: 1
    }

    const router = useRouter()

    const [sale, setSale] = useState<ISale>(initialSale)

    const [openAddSale, setOpenSale] = useState<boolean>(false)
    const [errorInput, setErrorInput] = useState<null | IErroForm>(null)

    const [listClients, setClients] = useState<Array<ICLient>>([])

    const [products, setProducts] = useState<Array<IProduct>>([])

    const [productSelecioned, setProductSelecioned] = useState<IProduct | null>(null)
    const [clientSelecioned, setClientSelecioned] = useState<ICLient | null>(null)

    const [openAddDiscount, setOpenAddDiscount] = useState<boolean>(false)


    const changeValues = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string> | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const name = e.target.name
        const value = e.target.value

        setSale({ ...sale, [name]: value })
    }

    const changeProductSelecioned = (newProduct: IProduct | null) => {
        const exist = sale.products.filter(p => p.id === newProduct?.id)

        if (exist.length > 0) {
            return toast.info("Produto já adicionado")
        }
        setProductSelecioned(newProduct)
    }

    const deleteProducList = (id: number) => {
        const product: IProductSale = sale.products.filter(p => p.id === id)[0]
        setSale({
            ...sale, products: sale.products.filter(p => p.id !== id), value: sale.value - product.totalCurrentPrice,
            valueCostPrice: sale.valueCostPrice - product.totalCostPrice
        })
    }

    const addSale = async () => {
        try {
            setErrorInput(null)

            let error: IErroForm = {}

            if ((sale.amountPaid <= 0 || sale.amountPaid.toString() === "" || sale.amountPaid < sale.value) && sale.paymentForm === "Dinheiro") {
                error = { ...error, amountPaid: true }
            }

            if (sale.paymentForm === "" || sale.paymentForm === null) {
                error = { ...error, paymentForm: true }
            }

            if (Object.keys(error).length !== 0) {
                return setErrorInput(error)
            }
            console.log("aqui", {
                ...sale,
                valueBeforeDIscount: sale.value,
                value: sale.value - sale.discount
            })
            // await SalesService.saveSale({
            //     ...sale,
            //     valueBeforeDIscount: sale.value,
            //     value: sale.value - sale.discount
            // })
            // toast.success("Sucesso ao realizar venda!")
            // goBack()
        } catch {
            toast.error("Erro ao realizar venda!")
        }
    }

    const getListClients = async () => {
        try {
            const { data } = await Client.getListClients()
            setClients(data)
        } catch { }
    }

    const goBack = () => {
        router.replace("/sales")
    }

    const closeAddDiscount = () => {
        setOpenAddDiscount(false)
        setSale({ ...sale, discount: 0 })
    }

    const getProductsList = async () => {
        try {
            const { data } = await ProductServices.getProducts({ name: '', barcode: '' })
            setProducts(data)
        } catch (error) {
            toast.error("Algo deu errado")
        }
    }

    const edtProductList = (product: IProductSale) => {
        setProductSelecioned(products.filter(p => p.id === product.id)[0])
        setSale({
            ...sale, qtd: product.qtdChange, products: sale.products.filter(p => p.id !== product.id), value: sale.value - product.totalCurrentPrice,
            valueCostPrice: sale.valueCostPrice - product.totalCostPrice
        })
    }

    const addDiscount = () => {
        setErrorInput(null)

        if (sale.discount === 0) {
            return setErrorInput({ ...errorInput, discount: true })
        }
        setSale({...sale, value: sale.value - sale.discount})
        setOpenAddDiscount(false)
    }

    const addProductList = () => {
        setErrorInput(null)

        let error: IErroForm = {}


        if (sale.clientId === '') {
            error = { ...error, clientId: true }
        }

        if (sale.qtd === 0 || sale.qtd === '') {
            error = { ...error, quantidade: true }
        }

        if (!productSelecioned) {
            error = { ...error, produtoId: true }
        }

        if ((sale.amountPaid <= 0 || sale.amountPaid.toString() === "" || sale.amountPaid < sale.value) && sale.paymentForm === "Dinheiro") {
            error = { ...error, amountPaid: true }
        }

        if (productSelecioned && (productSelecioned.qtdCurrent < parseInt(sale.qtd.toString()))) {
            return toast.info(`Só existe ${productSelecioned.qtdCurrent} unidades de ${productSelecioned.name} no estoque`)
        }

        if (Object.keys(error).length !== 0) {
            return setErrorInput(error)
        }

        const valueTotalCurrentPrice = productSelecioned?.salePrice ? parseFloat((productSelecioned?.salePrice * parseInt(sale.qtd.toString())).toFixed(2)) : 0
        const valueTotalCostPrice = productSelecioned?.costPrice ? parseFloat((productSelecioned?.costPrice * parseInt(sale.qtd.toString())).toFixed(2)) : 0

        setSale({
            ...sale,
            qtd: '',
            products: [
                ...sale.products,
                {
                    id: productSelecioned?.id ?? 0,
                    productName: productSelecioned?.name ?? "",
                    productId: productSelecioned?.id ?? 0,
                    newQtd: productSelecioned?.qtdCurrent ? productSelecioned?.qtdCurrent - parseInt(sale.qtd.toString()) : 0,
                    qtdChange: sale.qtd,
                    totalCostPrice: productSelecioned?.costPrice ? productSelecioned?.costPrice * parseInt(sale.qtd.toString()) : 0,
                    totalCurrentPrice: valueTotalCurrentPrice,
                    currentPrice: productSelecioned?.salePrice ?? 0,
                    oldQtd: productSelecioned?.qtdCurrent ?? 0
                }],
            value: sale.value + valueTotalCurrentPrice,
            valueCostPrice: sale.valueCostPrice + valueTotalCostPrice
        })

        setProductSelecioned(null)
    }

    useEffect(() => {
        getListClients()
        getProductsList()
    }, [])

    useEffect(() => {
        if (clientSelecioned) {
            setSale({ ...sale, clientId: clientSelecioned.id })
        } else {
            setSale({ ...sale, clientId: '' })
        }
    }, [clientSelecioned])

    //Calcula o troco quando a forma de pagamento é dinheiro
    useEffect(() => {
        let resultCustomerChangeCash = sale.value < sale.amountPaid ? parseFloat((sale.amountPaid - (sale.value - sale.discount)).toFixed(2)) : 0
        sale.amountPaid > 0 ? setSale({ ...sale, customerChangeCash: resultCustomerChangeCash }) : setSale({ ...sale, customerChangeCash: 0, amountPaid: 0 })
    }, [sale.value, sale.amountPaid, sale.discount, sale.paymentForm])

    //Faz o reset dos dados de pagamento caso a forma de pagamento mude
    useEffect(() => {
        setSale({ ...sale, customerChangeCash: 0, amountPaid: 0, paymentInstallments: 1 })
    }, [sale.paymentForm])

    return (
        <React.Fragment>
            <PageHeader title="Realizar Venda">
            </PageHeader>
            <ContainerCustom>
                <Stack
                    direction="row"
                    spacing={2}>
                    <Autocomplete
                        size="small"
                        disablePortal
                        options={listClients}
                        disabled={sale.products.length > 0}
                        getOptionLabel={(option) => option.name}
                        renderOption={(props, option) => {
                            return (
                                <li {...props} key={option.id}>
                                    {option.name}
                                </li>
                            );
                        }}
                        onChange={(event, newValue) => setClientSelecioned(newValue)}
                        value={clientSelecioned}
                        renderInput={(params) => (
                            <FormControl variant="outlined" sx={{ minWidth: 220 }} size="small" error={errorInput?.clientId} >
                                <TextField
                                    {...params}
                                    error={errorInput?.clientId}
                                    label="Nome do Cliente *"
                                />
                                {(errorInput?.clientId) && (
                                    <FormHelperText>Campo obrigatório!</FormHelperText>
                                )}
                            </FormControl>
                        )}
                    />
                    <Autocomplete
                        size="small"
                        disablePortal
                        options={products}
                        getOptionLabel={(option) => option.name}
                        renderOption={(props, option) => {
                            return (
                                <li {...props} key={option.id}>
                                    {option.name}
                                </li>
                            );
                        }}
                        onChange={(event, newValue) => changeProductSelecioned(newValue)}
                        value={productSelecioned}
                        renderInput={(params) => (
                            <FormControl variant="outlined" sx={{ minWidth: 220 }} size="small" error={errorInput?.produtoId} >
                                <TextField
                                    {...params}
                                    error={errorInput?.produtoId}
                                    label="Nome do Produto *"
                                />
                                {(errorInput?.produtoId) && (
                                    <FormHelperText>Campo obrigatório!</FormHelperText>
                                )}
                            </FormControl>
                        )}
                    />
                    <CustomTextInput value={sale?.qtd} label={"Quantidade *"} name={"qtd"} changeFunction={changeValues} error={errorInput?.quantidade} />
                    <FormControl>
                        <ButtonPlus onCLick={addProductList} title="Adicionar" />
                    </FormControl>
                </Stack>
            </ContainerCustom>
            <ContainerCustom>
                {sale.products.length > 0 && (
                    <TableCustom
                        data={sale.products}
                        titles={titles}
                        remove={true}
                        removeFunction={deleteProducList}
                        edit={true}
                        editFunction={edtProductList}
                        sum={true}
                        subValue={sale.discount}
                    />
                )}
                <Box sx={{ display: 'flex' }}>
                    <Stack direction="row" spacing={2}>
                        {sale.products.length > 0 && (
                            <>
                                <FormControl variant="outlined" sx={{ minWidth: 220 }} size="small" error={errorInput?.paymentForm}>
                                    <InputLabel id="demo-simple-select-standard-label">Forma de pagamento</InputLabel>
                                    <Select
                                        label="Forma de pagamento"
                                        value={sale?.paymentForm}
                                        name="paymentForm"
                                        onChange={changeValues}
                                    >
                                        {paymentForms.map((paymentForm, index: number) => (
                                            <MenuItem key={index} value={paymentForm}>{paymentForm}</MenuItem>
                                        ))}
                                    </Select>
                                    {errorInput?.paymentForm && (
                                        <FormHelperText>Campo obrigatório</FormHelperText>
                                    )}
                                </FormControl>
                                {sale.paymentForm === "Cartão de Crédito Parcelado" && (<CustomTextInput label={"Parcelas"} type={"number"} value={sale.paymentInstallments} name={"paymentInstallments"} changeFunction={changeValues} />)}
                                {sale.paymentForm === "Dinheiro" && (
                                    <>
                                        <CustomTextInput label={"Valor Pago"} type="number" value={sale.amountPaid} adorment="currency" name={"amountPaid"} changeFunction={changeValues} error={errorInput?.amountPaid} errorMessage={sale.amountPaid < sale.value ? "Valor inválido" : ""} />
                                        <Typography>Troco: R$ {sale.customerChangeCash}</Typography>
                                    </>
                                )}

                            </>
                        )}
                    </Stack>
                </Box>
                <Box sx={{ display: 'flex', placeContent: 'flex-end' }}>
                    <Stack direction="row" spacing={2}>
                        <Button color="error" variant="outlined" endIcon={<CloseIcon />} onClick={goBack} >Cancelar</Button>
                        {sale.products.length > 0 && (
                            <>
                                <Button color="info" variant="contained" onClick={() => setOpenAddDiscount(true)} >Adicionar Desconto</Button>
                                <Button color="success" variant="contained" onClick={() => setOpenSale(true)}>FInalizar Venda</Button>
                            </>
                        )}
                    </Stack>
                </Box>
            </ContainerCustom>
            <ConfirmPopup
                toggle={openAddSale}
                title={"Cadastrar venda"}
                message={"Deseja confirma venda?"}
                confirmAction={addSale}
                cancelFunction={() => setOpenSale(false)}
            />

            <CustomPopup
                toggle={openAddDiscount}
                title={"Adicionar Desconto"}
                confirmButtonTitle="Salvar"
                confirmButtonIcon={<SaveIcon />}
                confirmAction={addDiscount}
                cancelFunction={closeAddDiscount}
            >
                <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    gridGap: 20
                }}>
                    <CustomTextInput value={sale?.discount} type={"number"} label={"Desconto *"} adorment="currency" name={"discount"} changeFunction={changeValues} error={errorInput?.discount} />
                </Box>
            </CustomPopup>
        </React.Fragment>
    )
}

export default SalesForm

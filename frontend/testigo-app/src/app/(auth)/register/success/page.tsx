import Success from "@/components/ui/success"


const page = () => {
    return (
        <Success text="Tu cuenta se creó exitosamente" buttonText="Comenzar" redirect="/dashboard" />
    )
}

export default page
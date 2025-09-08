import * as Yup from "yup";
import LoginRegisterService from "../service/login-registerService";

// ---
// NEW: Validation schema for Trip entity
const saveTripSchema = Yup.object().shape({
    name: Yup.string()
        .min(2, 'Tên chuyến đi tối thiểu phải 2 kí tự') // Updated message
        .required('Vui lòng không được để trống'),
    departure: Yup.string() // New field
        .required('Vui lòng nhập điểm xuất phát'),
    destination: Yup.string() // New field
        .required('Vui lòng nhập điểm đến'),
    licensePlate: Yup.string() // New field
        .required('Vui lòng nhập biển số xe'),
    seat: Yup.number() // New field (was bedroom)
        .min(1, 'Số ghế phải lớn hơn 0')
        .required('Vui lòng nhập số ghế'),
    driver: Yup.string() // New field (was facility, for driver info from TinyMCE)
        .required('Vui lòng nhập thông tin tài xế'),
    // These address fields are for the general 'address' of the trip (e.g., base location)
    province: Yup.string()
        .required('Vui lòng chọn Tỉnh/Thành phố'),
    district: Yup.string()
        .required('Vui lòng chọn Quận/Huyện'),
    ward: Yup.string()
        .required('Vui lòng chọn Phường/Xã'),
    tripNumber: Yup.string() // Kept for general address detail
        .required('Vui lòng nhập số nhà/đường'),
    price: Yup.number()
        .min(1, 'Giá tiền phải lớn hơn 0')
        .required('Vui lòng không được để trống'),
    sale: Yup.number()
        .min(0, 'Giảm giá phải lớn hơn hoặc bằng 0')
        .max(100, 'Giảm giá phải nhỏ hơn hoặc bằng 100')
        .required('Vui lòng không được để trống'),
    area: Yup.number() // Still exists in Trip entity
        .min(1, 'Diện tích phải lớn hơn 0')
        .required('Vui lòng không được để trống'),
    description: Yup.string()
        .required('Vui lòng không được để trống'),
    thumbnail: Yup.string()
        .required('Vui lòng không được để trống'),
    images: Yup.string()
        .required('Vui lòng không được để trống'),
    departureDate: Yup.date() // New field for departure date
        .required('Vui lòng chọn ngày khởi hành')
        .min(new Date(), 'Ngày khởi hành không được ở quá khứ'), // Ensures date is today or in the future
});

// ---

const loginSchema = Yup.object({
    username: Yup.string()
        .required('Vui lòng nhập tên đăng nhập')
        .test('Check username', 'Tên đăng nhập không tồn tại', async (value) => {
            const checkUser = await LoginRegisterService.checkUsername(value);
            return checkUser.data;
        }),
    password: Yup.string()
        .required('Vui lòng nhập mật khẩu')
});

const registerSchema = Yup.object({
    username: Yup.string().required('Vui lòng nhập tên đăng nhập')
        .matches(/^[A-Za-z0-9]+(?:[ _][A-Za-z0-9]+)*$/, 'Tên đăng nhập không được chứa kí tự đặc biệt')
        .test('unique', 'Tên đăng nhập đã tồn tại', async (value) => {
            let checkUsername = await LoginRegisterService.checkUsername(value);
            return !checkUsername.data;
        }),
    email: Yup.string().email('Email không hợp lệ')
        .required('Vui lòng nhập email')
        .test('unique', 'Email đã tồn tại', async (value) => {
            let checkEmail = await LoginRegisterService.checkEmail(value);
            return !checkEmail.data;
        }),
    password: Yup.string()
        .required('Mật khẩu không được bỏ trống')
        .min(6, 'Mật khẩu phải chứa ít nhất 6 kí tự')
        .matches(
            /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/,
            'Mật khẩu phải chứa chữ cái viết hoa, viết thường và ký tự số'
        ),
    confirmPassword: Yup.string()
        .required('Vui lòng xác nhận lại mật khẩu')
        .oneOf([Yup.ref('password'), null], 'Mật khẩu không khớp')
});

const forgotPasswordSchema = Yup.object({
    email: Yup.string().email('Email không hợp lệ').required('Vui lòng nhập email')
});

const profileSchema = Yup.object().shape({
    firstname: Yup.string()
        .min(2, "Họ có ít nhất 2 ký tự!")
        .required("Họ không được để trống"),
    lastname: Yup.string()
        .min(2, "Tên có ít nhất 2 ký tự!")
        .required("Tên không được để trống"),
    address: Yup.string()
        .min(2, "Mô tả dài hơn 2 ký tự!")
        .required("Địa chỉ không được để trống"),
    email: Yup.string()
        .matches(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/, "Nhập email có dạng @gmail")
        .min(11, "Email phải dài hơn 10 ký tự!")
        .required("Email không được để trống"),
    phone: Yup.string()
        .length(10, "Số điện phải gồm 10 số!")
        .typeError("Số điện thoại phải nhập số")
        .required("Số điện thoại không được để trống")
        .matches(/^0[0-9]{9}$/, "Số điện thoại phải bắt đầu bằng số 0 và gồm 10 chữ số!"),
    province: Yup.string()
        .required('Vui lòng không được để trống'),
    district: Yup.string()
        .required('Vui lòng không được để trống'),
    ward: Yup.string()
        .required('Vui lòng không được để trống'),
});
const blankRegex = /[\s]/
const changePasswordSchema = Yup.object().shape({
    password: Yup.string()
        .required('Mật khẩu không được bỏ trống'),
    newPassword: Yup.string()
        .min(6, "Mật khẩu có độ dài 6-18 ký tự!")
        .max(18, "Mật khẩu có độ dài 5-18 ký tự!")
        .matches(
            /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/,
            'Mật khẩu phải chứa chữ cái viết hoa, viết thường và ký tự số'
        )
        .required("Mật khẩu không được để trống")
        .test('no-whitespance', "Mật không để trống hoặc chứa dấu cách", function (value) {
            return !blankRegex.test(value);
        }),
    confirmNewPassword: Yup.string()
        .required('Vui lòng xác nhận lại mật khẩu')
        .oneOf([Yup.ref('newPassword'), null], 'Mật khẩu không khớp')
});

const reviewSchema = Yup.object().shape({
    comment: Yup.string()
        .required('Vui lòng không được để trống')
});

export {
    saveTripSchema, // Updated export name
    loginSchema,
    registerSchema,
    profileSchema,
    changePasswordSchema,
    forgotPasswordSchema,
    reviewSchema
};
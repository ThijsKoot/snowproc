class Course {
    constructor() {
        
    }

    static create(courseName: string, userCount: number, userPassword: string): Course {
        let course =  <Course>{
            courseName: courseName,
            userCount: userCount,
            userPassword: userPassword
        }

        course.users = Array.from(course.generateUserNames());

        return course;
    }

    private padNumber(number: number, width: number, padding: string = '0'): string {
        let result = number.toString();
        return result.length >= width
            ? number.toString()
            : new Array(width - result.length + 1).join(padding) + number;
    }

    courseName: string = undefined;
    userCount: number = undefined;
    userPassword: string = undefined;

    public get roleName(): string {
        return `${this.courseName}_ROLE`;
    }

    public *generateUserNames() {
        let i = 0;
        while (i < this.userCount) {
            yield `${this.courseName}${this.padNumber(i, 2)}`;
            i++;
        }
    }

    public users: string[] = new Array<string>();
}
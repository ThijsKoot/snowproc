import { Procedure, Rights, SnowflakeClient } from "snowproc";

class CreateCourseArgs {
    courseName: string
    userPassword: string
    count: number
}

class CreateCourse extends Procedure {
    rights = Rights.Owner

    run = (client : SnowflakeClient, args: CreateCourseArgs) => {
        const course = Course.create(args.courseName, args.count, args.userPassword)
        const roleName = course.roleName

        client.execute(`create or replace role ${roleName}`)
        
        // Allows sysadmin to manage objects created by course users
        client.execute(`grant role ${roleName} to role course_admin_role`)

        client.execute(`grant create warehouse on account to role ${roleName}`)
        client.execute(`grant create database on account to role ${roleName}`)

        const courseUsers = course.users
            .map(u => `'${u}'`)
            .join(',')

        client.execute(`insert into course_admin.public.course (coursename, usercount, userpassword, users) 
                        select '${args.courseName}', ${args.count}, '${args.userPassword}', array_construct(${courseUsers})`)

        for (let user of course.users) {
            client.execute(`create user ${user} with
                password = '${args.userPassword}'
                default_role = '${course.roleName}'
                must_change_password = false;`)

            client.execute(`grant role ${roleName} to user ${user}`)
        }
    }
}